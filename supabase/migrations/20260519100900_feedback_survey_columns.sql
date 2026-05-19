alter table public.feedback_responses
add column if not exists found_useful boolean null,
add column if not exists most_useful_feature text null,
add column if not exists recommendation_accuracy integer null,
add column if not exists likelihood_to_recommend integer null,
add column if not exists plan_to_purchase text null;

alter table public.feedback_responses
drop constraint if exists feedback_responses_recommendation_accuracy_check,
add constraint feedback_responses_recommendation_accuracy_check
check (
  recommendation_accuracy is null
  or (recommendation_accuracy >= 1 and recommendation_accuracy <= 5)
);

alter table public.feedback_responses
drop constraint if exists feedback_responses_likelihood_to_recommend_check,
add constraint feedback_responses_likelihood_to_recommend_check
check (
  likelihood_to_recommend is null
  or (likelihood_to_recommend >= 1 and likelihood_to_recommend <= 5)
);

alter table public.feedback_responses
drop constraint if exists feedback_responses_most_useful_feature_check,
add constraint feedback_responses_most_useful_feature_check
check (
  most_useful_feature is null
  or most_useful_feature in ('recommendation', 'compare', 'lessons', 'saved_devices')
);

alter table public.feedback_responses
drop constraint if exists feedback_responses_plan_to_purchase_check,
add constraint feedback_responses_plan_to_purchase_check
check (
  plan_to_purchase is null
  or plan_to_purchase in ('yes', 'no', 'maybe')
);
