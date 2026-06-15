// Store / UI Busy 狀態
export type ActionReason =
  // Auth
  | 'LOGGING_IN'
  | 'REGISTERING'

  // User
  | 'UPDATING_PROFILE'

  // Restaurant
  | 'CREATING_RESTAURANT'
  | 'UPDATING_RESTAURANT'
  | 'DELETING_RESTAURANT'

  // Review
  | 'FETCHING_REVIEWS'
  | 'CREATING_REVIEW'
  | 'UPDATING_REVIEW'
  | 'DELETING_REVIEW'

  // reply
  | 'CREATING_REVIEW_REPLY'
  | 'UPDATING_REVIEW_REPLY'  
  | 'DELETING_REVIEW_REPLY'   

  // Admin Restaurant Review
  | 'APPROVING_RESTAURANT'
  | 'REJECTING_RESTAURANT'