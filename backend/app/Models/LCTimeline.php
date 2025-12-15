<?php

namespace App\Models;

use App\Enums\LCAction;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LCTimeline extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lc_timelines';

    /**
     * Disable Laravel's automatic timestamp management
     * (we use performed_at instead of created_at/updated_at)
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'master_lc_id',
        'action',
        'description',
        'previous_status',
        'new_status',
        'performed_by',
        'user_role',
        'metadata',
        'remarks',
        'performed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'metadata' => 'array',
        'performed_at' => 'datetime',
        'action' => LCAction::class,
    ];

    /**
     * Get the Master LC that owns the timeline entry.
     */
    public function masterLC(): BelongsTo
    {
        return $this->belongsTo(MasterLC::class, 'master_lc_id');
    }

    /**
     * Scope to order by most recent first.
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('performed_at', 'desc');
    }

    /**
     * Scope to order by oldest first.
     */
    public function scopeOldest($query)
    {
        return $query->orderBy('performed_at', 'asc');
    }

    /**
     * Scope to filter by action.
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Get formatted performed date.
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->performed_at->format('M d, Y h:i A');
    }

    /**
     * Get time ago format.
     */
    public function getTimeAgoAttribute(): string
    {
        return $this->performed_at->diffForHumans();
    }
}
