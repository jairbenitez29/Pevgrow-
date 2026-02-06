'use client';

interface Step {
  number: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { number: 1, title: 'Dirección', description: 'Datos de envío' },
  { number: 2, title: 'Envío', description: 'Método de entrega' },
  { number: 3, title: 'Pago', description: 'Forma de pago' },
  { number: 4, title: 'Confirmar', description: 'Revisar pedido' },
];

interface CheckoutStepsProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  canNavigate?: (step: number) => boolean;
}

export default function CheckoutSteps({
  currentStep,
  onStepClick,
  canNavigate = () => true
}: CheckoutStepsProps) {
  return (
    <nav aria-label="Progreso del checkout">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = onStepClick && canNavigate(step.number) && step.number < currentStep;

          return (
            <li key={step.number} className="relative flex-1">
              {/* Línea conectora */}
              {index < STEPS.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    isCompleted ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step indicator */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={`relative flex flex-col items-center group ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all z-10 ${
                    isCompleted
                      ? 'bg-purple-600 text-white'
                      : isCurrent
                      ? 'bg-purple-600 text-white ring-4 ring-purple-100'
                      : 'bg-gray-200 text-gray-500'
                  } ${isClickable ? 'group-hover:ring-4 group-hover:ring-purple-100' : ''}`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </span>

                <span
                  className={`mt-2 text-sm font-medium ${
                    isCurrent || isCompleted ? 'text-purple-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>

                <span className="text-xs text-gray-400 hidden sm:block">
                  {step.description}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
