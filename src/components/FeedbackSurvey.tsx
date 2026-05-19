import React, { useMemo, useState } from 'react';
import styles from '../styles/RoleDashboard.module.css';

type MostUsefulFeature = 'recommendation' | 'compare' | 'lessons' | 'saved_devices' | null;
type PurchaseIntent = 'yes' | 'no' | 'maybe' | null;

export interface SurveyValues {
  rating: number;
  found_useful: boolean | null;
  most_useful_feature: MostUsefulFeature;
  recommendation_accuracy: number | null;
  likelihood_to_recommend: number | null;
  plan_to_purchase: PurchaseIntent;
  comment: string;
}

interface FeedbackSurveyProps {
  initialValues: SurveyValues;
  isSubmitting: boolean;
  onSubmit: (values: SurveyValues) => Promise<void> | void;
}

const initialErrors = {
  rating: '',
  foundUseful: '',
  feature: '',
  recommendationAccuracy: '',
  likelihood: '',
  purchaseIntent: ''
};

const FeedbackSurvey: React.FC<FeedbackSurveyProps> = ({ initialValues, isSubmitting, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<SurveyValues>(initialValues);
  const [errors, setErrors] = useState(initialErrors);

  const isExistingResponse = useMemo(() => Boolean(initialValues.rating), [initialValues.rating]);
  const canGoBack = step > 1;
  const isLastStep = step === 3;

  const setNumericValue =
    (key: 'rating' | 'recommendation_accuracy' | 'likelihood_to_recommend') => (value: number) => {
      setValues(previous => ({ ...previous, [key]: value }));
    };

  const validateStep = () => {
    const nextErrors = { ...initialErrors };

    if (step === 1) {
      if (values.rating < 1 || values.rating > 5) nextErrors.rating = 'Choose a rating from 1 to 5.';
      if (values.found_useful === null) nextErrors.foundUseful = 'Select Yes or No.';
      if (!values.most_useful_feature) nextErrors.feature = 'Select the most useful feature.';
    }

    if (step === 2) {
      if (!values.recommendation_accuracy) {
        nextErrors.recommendationAccuracy = 'Rate recommendation accuracy from 1 to 5.';
      }
      if (!values.likelihood_to_recommend) {
        nextErrors.likelihood = 'Rate likelihood to recommend from 1 to 5.';
      }
      if (!values.plan_to_purchase) nextErrors.purchaseIntent = 'Select Yes, No, or Maybe.';
    }

    setErrors(nextErrors);
    return Object.values(nextErrors).every(value => !value);
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(previous => Math.min(previous + 1, 3));
  };

  const handleBack = () => {
    setStep(previous => Math.max(previous - 1, 1));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep()) return;
    await onSubmit(values);
  };

  return (
    <form className={styles.feedbackForm} onSubmit={handleSubmit}>
      <div className={styles.surveyProgress}>Step {step} of 3</div>

      {step === 1 && (
        <div className={styles.surveyStep}>
          <label className={styles.fieldLabel}>Overall rating (1 to 5)</label>
          <div className={styles.scaleRow}>
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={`rating-${value}`}
                type="button"
                className={styles.radioOption}
                onClick={() => setNumericValue('rating')(value)}
                aria-pressed={values.rating === value}
              >
                {value}
              </button>
            ))}
          </div>
          {errors.rating && <p className={styles.note}>{errors.rating}</p>}

          <label className={styles.fieldLabel}>Did this platform help you select a device?</label>
          <div className={styles.radioGroup}>
            {[
              { label: 'Yes', value: true },
              { label: 'No', value: false }
            ].map(option => (
              <button
                key={`useful-${option.label}`}
                type="button"
                className={styles.radioOption}
                onClick={() => setValues(previous => ({ ...previous, found_useful: option.value }))}
                aria-pressed={values.found_useful === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.foundUseful && <p className={styles.note}>{errors.foundUseful}</p>}

          <label className={styles.fieldLabel}>Which feature was most useful?</label>
          <div className={styles.radioGroup}>
            {[
              { label: 'Recommendations', value: 'recommendation' as const },
              { label: 'Compare Devices', value: 'compare' as const },
              { label: 'Lessons', value: 'lessons' as const },
              { label: 'Saved Devices', value: 'saved_devices' as const }
            ].map(option => (
              <button
                key={`feature-${option.value}`}
                type="button"
                className={styles.radioOption}
                onClick={() => setValues(previous => ({ ...previous, most_useful_feature: option.value }))}
                aria-pressed={values.most_useful_feature === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.feature && <p className={styles.note}>{errors.feature}</p>}
        </div>
      )}

      {step === 2 && (
        <div className={styles.surveyStep}>
          <label className={styles.fieldLabel}>Recommendation accuracy (1 to 5)</label>
          <div className={styles.scaleRow}>
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={`accuracy-${value}`}
                type="button"
                className={styles.radioOption}
                onClick={() => setNumericValue('recommendation_accuracy')(value)}
                aria-pressed={values.recommendation_accuracy === value}
              >
                {value}
              </button>
            ))}
          </div>
          {errors.recommendationAccuracy && <p className={styles.note}>{errors.recommendationAccuracy}</p>}

          <label className={styles.fieldLabel}>Likelihood to recommend to classmates (1 to 5)</label>
          <div className={styles.scaleRow}>
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={`recommend-${value}`}
                type="button"
                className={styles.radioOption}
                onClick={() => setNumericValue('likelihood_to_recommend')(value)}
                aria-pressed={values.likelihood_to_recommend === value}
              >
                {value}
              </button>
            ))}
          </div>
          {errors.likelihood && <p className={styles.note}>{errors.likelihood}</p>}

          <label className={styles.fieldLabel}>Do you plan to purchase a shown device?</label>
          <div className={styles.radioGroup}>
            {[
              { label: 'Yes', value: 'yes' as const },
              { label: 'No', value: 'no' as const },
              { label: 'Maybe', value: 'maybe' as const }
            ].map(option => (
              <button
                key={`purchase-${option.value}`}
                type="button"
                className={styles.radioOption}
                onClick={() => setValues(previous => ({ ...previous, plan_to_purchase: option.value }))}
                aria-pressed={values.plan_to_purchase === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.purchaseIntent && <p className={styles.note}>{errors.purchaseIntent}</p>}
        </div>
      )}

      {step === 3 && (
        <div className={styles.surveyStep}>
          <label className={styles.fieldLabel} htmlFor="feedback-comment">
            What helped most, or what should improve?
          </label>
          <textarea
            id="feedback-comment"
            className={styles.fieldInput}
            value={values.comment}
            onChange={event => setValues(previous => ({ ...previous, comment: event.target.value }))}
            rows={4}
            placeholder="Share your suggestions for improving DeviceSelect."
          />
        </div>
      )}

      <div className={styles.sectionActions}>
        {canGoBack && (
          <button type="button" className={styles.inlineButton} onClick={handleBack}>
            Back
          </button>
        )}
        {!isLastStep && (
          <button type="button" className={styles.inlineButton} onClick={handleNext}>
            Next
          </button>
        )}
        {isLastStep && (
          <button type="submit" className={styles.inlineButton} disabled={isSubmitting}>
            {isExistingResponse ? 'Update Survey' : 'Submit Survey'}
          </button>
        )}
      </div>
    </form>
  );
};

export default FeedbackSurvey;
