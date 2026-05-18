import { supabase } from '../lib/supabase';
import { isUuid } from './isUuid';

export type InteractionEventType = 'recommendation_view' | 'comparison_click';

export interface InteractionEvent {
  user_id?: string;
  event_type: InteractionEventType;
  created_at: string;
}

interface RecordInteractionResult {
  ok: boolean;
  reason: 'missing_user' | 'insert_failed' | null;
}

type ColumnCandidate = 'event_type' | 'interaction_type' | 'action_type';

const eventColumns: ColumnCandidate[] = ['event_type', 'interaction_type', 'action_type'];
let cachedInsertColumn: ColumnCandidate | null = null;

const hasDeviceIdConstraintError = (error: { code?: string; details?: string; message?: string } | null) => {
  if (!error) return false;
  if (error.code === '23503') return true;

  const normalizedDetails = `${error.details ?? ''} ${error.message ?? ''}`.toLowerCase();
  return normalizedDetails.includes('device_id') || normalizedDetails.includes('foreign key');
};

const normalizeEventType = (value: unknown): InteractionEventType | null => {
  if (value === 'recommendation_view' || value === 'comparison_click') {
    return value;
  }
  return null;
};

const mapRows = (rows: Array<Record<string, unknown>>, column: ColumnCandidate): InteractionEvent[] => {
  const normalizedRows: InteractionEvent[] = [];

  rows.forEach(row => {
    const eventType = normalizeEventType(row[column]);
    if (!eventType) return;

    normalizedRows.push({
      user_id: typeof row.user_id === 'string' ? row.user_id : undefined,
      event_type: eventType,
      created_at: typeof row.created_at === 'string' ? row.created_at : ''
    });
  });

  return normalizedRows;
};

export const fetchInteractionEvents = async (userId?: string): Promise<InteractionEvent[]> => {
  const query = supabase.from('interaction_logs').select('*');
  const scopedQuery = userId ? query.eq('user_id', userId) : query;
  const { data, error } = await scopedQuery;

  if (error) {
    return [];
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  for (const column of eventColumns) {
    const normalizedRows = mapRows(rows, column);
    if (normalizedRows.length > 0) {
      return normalizedRows;
    }
  }

  return [];
};

export const recordInteractionEvent = async (
  userId: string | undefined,
  eventType: InteractionEventType,
  deviceId?: string
): Promise<RecordInteractionResult> => {
  if (!userId) {
    return {
      ok: false,
      reason: 'missing_user'
    };
  }

  const safeDeviceId = deviceId && isUuid(deviceId) ? deviceId : null;
  const columnsToTry = cachedInsertColumn
    ? [cachedInsertColumn, ...eventColumns.filter(column => column !== cachedInsertColumn)]
    : eventColumns;

  for (const column of columnsToTry) {
    const payload: Record<string, unknown> = {
      user_id: userId,
      [column]: eventType
    };

    if (safeDeviceId) {
      payload.device_id = safeDeviceId;
    }

    const { error } = await supabase.from('interaction_logs').insert(payload);

    if (!error) {
      cachedInsertColumn = column;
      return {
        ok: true,
        reason: null
      };
    }

    if (safeDeviceId && hasDeviceIdConstraintError(error)) {
      const fallbackPayload = {
        user_id: userId,
        [column]: eventType
      };
      const fallbackResult = await supabase.from('interaction_logs').insert(fallbackPayload);

      if (!fallbackResult.error) {
        cachedInsertColumn = column;
        return {
          ok: true,
          reason: null
        };
      }
    }
  }

  return {
    ok: false,
    reason: 'insert_failed'
  };
};
