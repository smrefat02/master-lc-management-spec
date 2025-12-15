<?php

namespace App\Services;

use App\Models\MasterLC;
use App\Enums\LCStatus;
use Illuminate\Validation\ValidationException;

class LCValidationService
{
    /**
     * Validate Apply transition
     */
    public function validateApply(MasterLC $masterLC): void
    {
        if (!$masterLC->canApply()) {
            throw ValidationException::withMessages([
                'lc_status' => 'LC must be in draft status to apply.',
            ]);
        }

        if ($masterLC->isExpired()) {
            throw ValidationException::withMessages([
                'expiry_date' => 'Cannot apply for an expired LC.',
            ]);
        }
    }

    /**
     * Validate Issue transition
     */
    public function validateIssue(MasterLC $masterLC, array $data): void
    {
        if (!$masterLC->canIssue()) {
            throw ValidationException::withMessages([
                'lc_status' => 'LC must be in applied status to issue.',
            ]);
        }

        if (empty($data['issuing_bank_id'])) {
            throw ValidationException::withMessages([
                'issuing_bank_id' => 'Issuing bank is required.',
            ]);
        }

        if (empty($data['issuing_bank_reference_no'])) {
            throw ValidationException::withMessages([
                'issuing_bank_reference_no' => 'Bank reference number is required.',
            ]);
        }

        if (empty($data['issuing_bank_issue_date'])) {
            throw ValidationException::withMessages([
                'issuing_bank_issue_date' => 'Issue date is required.',
            ]);
        }
    }

    /**
     * Validate Advise transition
     */
    public function validateAdvise(MasterLC $masterLC, array $data): void
    {
        if (!$masterLC->canAdvise()) {
            throw ValidationException::withMessages([
                'lc_status' => 'LC must be issued by issuing bank to advise.',
            ]);
        }

        if (empty($data['advising_bank_id'])) {
            throw ValidationException::withMessages([
                'advising_bank_id' => 'Advising bank is required.',
            ]);
        }

        if (empty($data['advising_bank_verification_status'])) {
            throw ValidationException::withMessages([
                'advising_bank_verification_status' => 'Verification status is required.',
            ]);
        }

        if (!in_array($data['advising_bank_verification_status'], ['verified', 'rejected'])) {
            throw ValidationException::withMessages([
                'advising_bank_verification_status' => 'Invalid verification status.',
            ]);
        }
    }

    /**
     * Validate Ship Goods transition
     */
    public function validateShipGoods(MasterLC $masterLC, array $data): void
    {
        if (!$masterLC->canShipGoods()) {
            throw ValidationException::withMessages([
                'lc_status' => 'LC must be verified by advising bank to ship goods.',
            ]);
        }

        if (empty($data['shipping_date'])) {
            throw ValidationException::withMessages([
                'shipping_date' => 'Shipping date is required.',
            ]);
        }

        if (empty($data['carrier'])) {
            throw ValidationException::withMessages([
                'carrier' => 'Carrier information is required.',
            ]);
        }

        if (empty($data['bill_of_lading_no'])) {
            throw ValidationException::withMessages([
                'bill_of_lading_no' => 'Bill of lading number is required.',
            ]);
        }
    }

    /**
     * Validate Receive Documents transition
     */
    public function validateReceiveDocuments(MasterLC $masterLC, array $data): void
    {
        if (!$masterLC->canReceiveDocuments()) {
            throw ValidationException::withMessages([
                'lc_status' => 'LC must have goods shipped to receive documents.',
            ]);
        }

        if (empty($data['received_documents']) || !is_array($data['received_documents'])) {
            throw ValidationException::withMessages([
                'received_documents' => 'List of received documents is required.',
            ]);
        }
    }

    /**
     * Validate Forward Documents transition
     */
    public function validateForwardDocuments(MasterLC $masterLC): void
    {
        if (!$masterLC->canForwardDocuments()) {
            throw ValidationException::withMessages([
                'lc_status' => 'LC must have documents received to forward them.',
            ]);
        }

        if (empty($masterLC->received_documents)) {
            throw ValidationException::withMessages([
                'received_documents' => 'No documents available to forward.',
            ]);
        }
    }

    /**
     * Validate Verify Documents transition
     */
    public function validateVerifyDocuments(MasterLC $masterLC, array $data): void
    {
        if (!$masterLC->canVerifyDocuments()) {
            throw ValidationException::withMessages([
                'lc_status' => 'LC must have documents forwarded to verify them.',
            ]);
        }

        if (empty($data['verification_status'])) {
            throw ValidationException::withMessages([
                'verification_status' => 'Verification status is required.',
            ]);
        }

        if (!in_array($data['verification_status'], ['approved', 'rejected'])) {
            throw ValidationException::withMessages([
                'verification_status' => 'Invalid verification status.',
            ]);
        }
    }

    /**
     * Validate Activate transition
     */
    public function validateActivate(MasterLC $masterLC): void
    {
        if (!$masterLC->canActivate()) {
            throw ValidationException::withMessages([
                'lc_status' => 'LC must have documents verified to activate.',
            ]);
        }

        if ($masterLC->isExpired()) {
            throw ValidationException::withMessages([
                'expiry_date' => 'Cannot activate an expired LC.',
            ]);
        }
    }

    /**
     * Validate Reject transition
     */
    public function validateReject(MasterLC $masterLC): void
    {
        if (!$masterLC->canReject()) {
            throw ValidationException::withMessages([
                'lc_status' => 'Cannot reject LC in terminal status.',
            ]);
        }
    }

    /**
     * Validate LC for editing
     */
    public function validateEdit(MasterLC $masterLC): void
    {
        if (!$masterLC->canBeEdited()) {
            throw ValidationException::withMessages([
                'lc_status' => 'Only draft LCs can be edited.',
            ]);
        }
    }

    /**
     * Validate LC for deletion
     */
    public function validateDelete(MasterLC $masterLC): void
    {
        if (!$masterLC->canBeDeleted()) {
            throw ValidationException::withMessages([
                'lc_status' => 'Only draft LCs can be deleted.',
            ]);
        }
    }
}
