<?php

namespace App\Services;

use App\Models\MasterLC;
use App\Enums\LCStatus;
use App\Enums\LCAction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LCWorkflowService
{
    protected $timelineService;
    protected $validationService;

    public function __construct(
        LCTimelineService $timelineService,
        LCValidationService $validationService
    ) {
        $this->timelineService = $timelineService;
        $this->validationService = $validationService;
    }

    /**
     * Apply for LC (Step 2: Draft → Applied)
     */
    public function applyForLC(MasterLC $masterLC, array $data = []): MasterLC
    {
        $this->validationService->validateApply($masterLC);

        return DB::transaction(function () use ($masterLC, $data) {
            $previousStatus = $masterLC->lc_status;
            
            $masterLC->update([
                'lc_status' => LCStatus::APPLIED,
                'applied_at' => now(),
                'applicant_remarks' => $data['applicant_remarks'] ?? null,
            ]);

            $this->timelineService->log(
                $masterLC,
                LCAction::APPLIED,
                "LC application submitted to issuing bank",
                $previousStatus->value,
                LCStatus::APPLIED->value,
                $data['applicant_remarks'] ?? null
            );

            return $masterLC->fresh(['issuingBank', 'advisingBank', 'timeline']);
        });
    }

    /**
     * Issue LC (Step 3: Applied → Issued by Issuing Bank)
     */
    public function issueLC(MasterLC $masterLC, array $data): MasterLC
    {
        $this->validationService->validateIssue($masterLC, $data);

        return DB::transaction(function () use ($masterLC, $data) {
            $previousStatus = $masterLC->lc_status;
            
            $masterLC->update([
                'lc_status' => LCStatus::ISSUED_BY_ISSUING_BANK,
                'issuing_bank_id' => $data['issuing_bank_id'],
                'issuing_bank_reference_no' => $data['issuing_bank_reference_no'],
                'issuing_bank_issue_date' => $data['issuing_bank_issue_date'],
                'issued_at' => now(),
                'issuer_remarks' => $data['issuer_remarks'] ?? null,
                // Default: advising bank same as issuing bank (can be overridden)
                'advising_bank_id' => $data['advising_bank_id'] ?? $data['issuing_bank_id'],
            ]);

            $this->timelineService->log(
                $masterLC,
                LCAction::ISSUED,
                "LC issued by {$masterLC->issuingBank->name}",
                $previousStatus->value,
                LCStatus::ISSUED_BY_ISSUING_BANK->value,
                $data['issuer_remarks'] ?? null,
                [
                    'issuing_bank_id' => $data['issuing_bank_id'],
                    'reference_no' => $data['issuing_bank_reference_no'],
                    'issue_date' => $data['issuing_bank_issue_date'],
                ]
            );

            return $masterLC->fresh(['issuingBank', 'advisingBank', 'timeline']);
        });
    }

    /**
     * Advise/Verify LC (Step 4: Issued → Verified by Advising Bank)
     */
    public function adviseLC(MasterLC $masterLC, array $data): MasterLC
    {
        $this->validationService->validateAdvise($masterLC, $data);

        return DB::transaction(function () use ($masterLC, $data) {
            $previousStatus = $masterLC->lc_status;
            
            $newStatus = $data['advising_bank_verification_status'] === 'verified'
                ? LCStatus::VERIFIED_BY_ADVISING_BANK
                : LCStatus::REJECTED;

            $masterLC->update([
                'lc_status' => $newStatus,
                'advising_bank_id' => $data['advising_bank_id'],
                'advising_bank_verification_status' => $data['advising_bank_verification_status'],
                'advising_bank_verified_at' => now(),
                'advisor_remarks' => $data['advisor_remarks'] ?? null,
                'rejection_reason' => $data['advising_bank_verification_status'] === 'rejected' 
                    ? ($data['advisor_remarks'] ?? 'Rejected by advising bank') 
                    : null,
            ]);

            $action = $newStatus === LCStatus::VERIFIED_BY_ADVISING_BANK 
                ? LCAction::VERIFIED 
                : LCAction::REJECTED;

            $this->timelineService->log(
                $masterLC,
                $action,
                $newStatus === LCStatus::VERIFIED_BY_ADVISING_BANK
                    ? "LC verified by {$masterLC->advisingBank->name}"
                    : "LC rejected by {$masterLC->advisingBank->name}",
                $previousStatus->value,
                $newStatus->value,
                $data['advisor_remarks'] ?? null,
                [
                    'advising_bank_id' => $data['advising_bank_id'],
                    'verification_status' => $data['advising_bank_verification_status'],
                ]
            );

            return $masterLC->fresh(['issuingBank', 'advisingBank', 'timeline']);
        });
    }

    /**
     * Ship Goods (Step 5: Verified → Goods Shipped)
     */
    public function shipGoods(MasterLC $masterLC, array $data): MasterLC
    {
        $this->validationService->validateShipGoods($masterLC, $data);

        return DB::transaction(function () use ($masterLC, $data) {
            $previousStatus = $masterLC->lc_status;
            
            $masterLC->update([
                'lc_status' => LCStatus::GOODS_SHIPPED,
                'shipment_id' => $data['shipment_id'] ?? null,
                'shipping_date' => $data['shipping_date'],
                'carrier' => $data['carrier'],
                'vessel_name' => $data['vessel_name'] ?? null,
                'bill_of_lading_no' => $data['bill_of_lading_no'],
                'port_of_loading' => $data['port_of_loading'] ?? null,
                'port_of_discharge' => $data['port_of_discharge'] ?? null,
                'goods_shipped_at' => now(),
                'shipper_remarks' => $data['shipper_remarks'] ?? null,
            ]);

            $this->timelineService->log(
                $masterLC,
                LCAction::GOODS_SHIPPED,
                "Goods shipped via {$data['carrier']}",
                $previousStatus->value,
                LCStatus::GOODS_SHIPPED->value,
                $data['shipper_remarks'] ?? null,
                [
                    'shipping_date' => $data['shipping_date'],
                    'carrier' => $data['carrier'],
                    'bill_of_lading_no' => $data['bill_of_lading_no'],
                ]
            );

            return $masterLC->fresh(['issuingBank', 'advisingBank', 'timeline']);
        });
    }

    /**
     * Receive Documents (Step 6: Goods Shipped → Documents Received)
     */
    public function receiveDocuments(MasterLC $masterLC, array $data): MasterLC
    {
        $this->validationService->validateReceiveDocuments($masterLC, $data);

        return DB::transaction(function () use ($masterLC, $data) {
            $previousStatus = $masterLC->lc_status;
            
            $masterLC->update([
                'lc_status' => LCStatus::DOCUMENTS_RECEIVED,
                'received_documents' => $data['received_documents'],
                'documents_received_at' => now(),
                'receiver_remarks' => $data['receiver_remarks'] ?? null,
            ]);

            $this->timelineService->log(
                $masterLC,
                LCAction::DOCUMENTS_RECEIVED,
                "Shipping documents received from exporter",
                $previousStatus->value,
                LCStatus::DOCUMENTS_RECEIVED->value,
                $data['receiver_remarks'] ?? null,
                [
                    'documents' => $data['received_documents'],
                ]
            );

            return $masterLC->fresh(['issuingBank', 'advisingBank', 'timeline']);
        });
    }

    /**
     * Forward Documents (Step 7: Documents Received → Documents Forwarded)
     */
    public function forwardDocuments(MasterLC $masterLC, array $data = []): MasterLC
    {
        $this->validationService->validateForwardDocuments($masterLC);

        return DB::transaction(function () use ($masterLC, $data) {
            $previousStatus = $masterLC->lc_status;
            
            $masterLC->update([
                'lc_status' => LCStatus::DOCUMENTS_FORWARDED,
                'documents_forwarded_at' => now(),
                'forwarder_remarks' => $data['forwarder_remarks'] ?? null,
            ]);

            $this->timelineService->log(
                $masterLC,
                LCAction::DOCUMENTS_FORWARDED,
                "Documents forwarded to issuing bank for verification",
                $previousStatus->value,
                LCStatus::DOCUMENTS_FORWARDED->value,
                $data['forwarder_remarks'] ?? null
            );

            return $masterLC->fresh(['issuingBank', 'advisingBank', 'timeline']);
        });
    }

    /**
     * Verify Documents (Step 8: Documents Forwarded → Documents Verified)
     */
    public function verifyDocuments(MasterLC $masterLC, array $data): MasterLC
    {
        $this->validationService->validateVerifyDocuments($masterLC, $data);

        return DB::transaction(function () use ($masterLC, $data) {
            $previousStatus = $masterLC->lc_status;
            
            $newStatus = $data['verification_status'] === 'approved'
                ? LCStatus::DOCUMENTS_VERIFIED
                : LCStatus::REJECTED;

            $masterLC->update([
                'lc_status' => $newStatus,
                'documents_verification_status' => $data['verification_status'],
                'document_discrepancies' => $data['discrepancies'] ?? null,
                'documents_verified_at' => now(),
                'verifier_remarks' => $data['verifier_remarks'] ?? null,
                'rejection_reason' => $data['verification_status'] === 'rejected'
                    ? ($data['verifier_remarks'] ?? 'Document discrepancies found')
                    : null,
            ]);

            $action = $newStatus === LCStatus::DOCUMENTS_VERIFIED
                ? LCAction::DOCUMENTS_VERIFIED
                : LCAction::REJECTED;

            $this->timelineService->log(
                $masterLC,
                $action,
                $newStatus === LCStatus::DOCUMENTS_VERIFIED
                    ? "Documents verified by issuing bank"
                    : "Documents rejected due to discrepancies",
                $previousStatus->value,
                $newStatus->value,
                $data['verifier_remarks'] ?? null,
                [
                    'verification_status' => $data['verification_status'],
                    'discrepancies' => $data['discrepancies'] ?? null,
                ]
            );

            return $masterLC->fresh(['issuingBank', 'advisingBank', 'timeline']);
        });
    }

    /**
     * Activate LC (Final Step: Documents Verified → Active)
     */
    public function activateLC(MasterLC $masterLC): MasterLC
    {
        $this->validationService->validateActivate($masterLC);

        return DB::transaction(function () use ($masterLC) {
            $previousStatus = $masterLC->lc_status;
            
            $masterLC->update([
                'lc_status' => LCStatus::ACTIVE,
                'activated_at' => now(),
            ]);

            $this->timelineService->log(
                $masterLC,
                LCAction::ACTIVATED,
                "LC activated and ready for use",
                $previousStatus->value,
                LCStatus::ACTIVE->value
            );

            return $masterLC->fresh(['issuingBank', 'advisingBank', 'timeline']);
        });
    }

    /**
     * Reject LC (Can be done at any stage)
     */
    public function rejectLC(MasterLC $masterLC, string $reason): MasterLC
    {
        $this->validationService->validateReject($masterLC);

        return DB::transaction(function () use ($masterLC, $reason) {
            $previousStatus = $masterLC->lc_status;
            
            $masterLC->update([
                'lc_status' => LCStatus::REJECTED,
                'rejection_reason' => $reason,
            ]);

            $this->timelineService->log(
                $masterLC,
                LCAction::REJECTED,
                "LC rejected",
                $previousStatus->value,
                LCStatus::REJECTED->value,
                $reason
            );

            return $masterLC->fresh(['issuingBank', 'advisingBank', 'timeline']);
        });
    }
}
