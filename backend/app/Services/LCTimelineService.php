<?php

namespace App\Services;

use App\Models\MasterLC;
use App\Models\LCTimeline;
use App\Enums\LCAction;
use Illuminate\Support\Facades\Auth;

class LCTimelineService
{
    /**
     * Log a timeline entry for LC workflow action
     */
    public function log(
        MasterLC $masterLC,
        LCAction $action,
        string $description,
        ?string $previousStatus = null,
        ?string $newStatus = null,
        ?string $remarks = null,
        ?array $metadata = null
    ): LCTimeline {
        return LCTimeline::create([
            'master_lc_id' => $masterLC->id,
            'action' => $action,
            'description' => $description,
            'previous_status' => $previousStatus,
            'new_status' => $newStatus,
            'performed_by' => Auth::check() ? Auth::user()->name : 'System',
            'user_role' => Auth::check() ? Auth::user()->role : null,
            'metadata' => $metadata,
            'remarks' => $remarks,
            'performed_at' => now(),
        ]);
    }

    /**
     * Log LC creation
     */
    public function logCreation(MasterLC $masterLC): LCTimeline
    {
        return $this->log(
            $masterLC,
            LCAction::CREATED,
            "LC {$masterLC->lc_number} was created",
            null,
            $masterLC->lc_status->value
        );
    }

    /**
     * Log LC update
     */
    public function logUpdate(MasterLC $masterLC, array $changes = []): LCTimeline
    {
        return $this->log(
            $masterLC,
            LCAction::UPDATED,
            "LC {$masterLC->lc_number} was updated",
            null,
            $masterLC->lc_status->value,
            null,
            ['changes' => $changes]
        );
    }

    /**
     * Get timeline for LC
     */
    public function getTimeline(MasterLC $masterLC)
    {
        return $masterLC->timeline()
            ->orderBy('performed_at', 'desc')
            ->get();
    }

    /**
     * Get formatted timeline for API response
     */
    public function getFormattedTimeline(MasterLC $masterLC): array
    {
        return $masterLC->timeline()
            ->orderBy('performed_at', 'desc')
            ->get()
            ->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'action' => $entry->action->value,
                    'action_label' => $entry->action->label(),
                    'description' => $entry->description,
                    'previous_status' => $entry->previous_status,
                    'new_status' => $entry->new_status,
                    'performed_by' => $entry->performed_by,
                    'user_role' => $entry->user_role,
                    'performed_at' => $entry->performed_at->toIso8601String(),
                    'performed_at_formatted' => $entry->performed_at->format('M d, Y h:i A'),
                    'time_ago' => $entry->performed_at->diffForHumans(),
                    'remarks' => $entry->remarks,
                    'metadata' => $entry->metadata,
                ];
            })
            ->toArray();
    }
}
