import { Check } from 'lucide-react';
import type { BackendInvoiceStatus } from '@/types/invoice';

interface WorkflowStep {
  key: BackendInvoiceStatus;
  label: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { key: 'uploaded', label: 'Uploaded' },
  { key: 'processing', label: 'AI Processing' },
  { key: 'extracted', label: 'Extracted' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'approved', label: 'Approved' },
  { key: 'paid', label: 'Paid' },
];

interface WorkflowTrackerProps {
  currentStatus: BackendInvoiceStatus;
}

export const WorkflowTracker: React.FC<WorkflowTrackerProps> = ({ currentStatus }) => {
  const currentIndex = WORKFLOW_STEPS.findIndex((step) => step.key === currentStatus);

  const getWorkflowAction = (): { label: string; nextStatus: BackendInvoiceStatus; disabled: boolean } | null => {
    const actions: Record<BackendInvoiceStatus, { label: string; nextStatus: BackendInvoiceStatus; disabled: boolean } | null> = {
      uploaded: { label: 'Processing...', nextStatus: 'processing', disabled: true },
      processing: { label: 'Processing...', nextStatus: 'extracted', disabled: true },
      extracted: { label: 'Start Review', nextStatus: 'reviewed', disabled: false },
      reviewed: { label: 'Approve Invoice', nextStatus: 'approved', disabled: false },
      approved: { label: 'Mark as Paid', nextStatus: 'paid', disabled: false },
      paid: null,
      overdue: null,
    };

    return actions[currentStatus];
  };

  const getHelperText = (): string => {
    const helperTexts: Record<BackendInvoiceStatus, string> = {
      uploaded: 'Invoice uploaded successfully.',
      processing: 'AI is extracting invoice information.',
      extracted: 'Review the extracted invoice information before approval.',
      reviewed: 'Invoice reviewed successfully. Ready for approval.',
      approved: 'Invoice approved. Ready for payment.',
      paid: 'Invoice workflow completed successfully.',
      overdue: 'Invoice is overdue.',
    };

    return helperTexts[currentStatus];
  };

  const action = getWorkflowAction();
  const helperText = getHelperText();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={step.key} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-[#558467] border-[#558467] text-white'
                      : isCurrent
                      ? 'bg-[#EAE0CF] border-[#17433F] text-[#17433F]'
                      : 'bg-[#EAE0CF] border-[#EFEABB] text-[#43637E]'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium mt-2 ${
                    isCurrent ? 'text-[#17433F]' : isCompleted ? 'text-[#17433F]' : 'text-[#43637E]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    index < currentIndex ? 'bg-[#558467]' : 'bg-[#EFEABB]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {action ? (
        <button
          type="button"
          onClick={() => {
            const event = new CustomEvent('workflowAdvance', {
              detail: { nextStatus: action.nextStatus },
            });
            window.dispatchEvent(event);
          }}
          disabled={action.disabled}
          className="w-full px-4 py-2.5 bg-[#17433F] text-white font-semibold rounded-xl hover:bg-[#558467] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {action.label}
        </button>
      ) : (
        <div className="text-center py-2 flex items-center justify-center space-x-2">
          <Check size={16} className="text-[#558467]" />
          <span className="text-sm font-medium text-[#558467]">Workflow Complete</span>
        </div>
      )}

      <p className="text-sm text-[#43637E] text-center">{helperText}</p>
    </div>
  );
};
