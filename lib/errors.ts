export const Errors = {
  auth: {
    unauthorized: "Authentication required.",
    invalidCredentials: "Invalid email or password.",
    sessionExpired: "Your session has expired. Please sign in again.",
    tokenInvalid: "Invalid or expired token.",
  },
  access: {
    forbidden: "You do not have permission to perform this action.",
    notFound: "The requested resource was not found.",
    adminOnly: "Access restricted.",
    roleRestricted: "This action is restricted to your account type.",
  },
  validation: {
    requiredField: "A required field is missing.",
    invalidFormat: "The provided data is not valid.",
    duplicateEntry: "This record already exists.",
    invalidStatus: "The selected status is not valid.",
    invalidType: "The provided type is not supported.",
  },
  resources: {
    postNotFound: "Post not found.",
    commentNotFound: "Comment not found.",
    connectionNotFound: "Connection not found.",
    userNotFound: "User not found.",
    workplaceNotFound: "Workplace not found.",
    projectNotFound: "Project not found.",
    companyNotFound: "Company not found.",
    jobNotFound: "Job not found.",
    notificationNotFound: "Notification not found.",
    taskNotFound: "Task not found.",
    clientNotFound: "Client not found.",
    meetingNotFound: "Meeting not found.",
    artifactNotFound: "Artifact not found.",
    templateNotFound: "Template not found.",
    quoteNotFound: "Quote not found.",
    proposalNotFound: "Proposal not found.",
    deliverableNotFound: "Deliverable not found.",
  },
  actions: {
    cannotFollowSelf: "You cannot follow yourself.",
    cannotEndorseSelf: "You cannot endorse yourself.",
    alreadyEndorsed: "You have already endorsed this skill.",
    alreadyConnected: "A connection already exists.",
    membershipRequired: "Membership is required for this action.",
    workplaceMemberRequired: "You must be a workplace member to post here.",
    projectAccessDenied: "You do not have access to this project.",
    limitReached: "The allowed limit has been reached.",
    operationFailed: "The operation could not be completed.",
    uploadFailed: "The upload failed. Please try again.",
    meetingCaptureFailed: "The meeting could not be processed.",
    proposalGenerationFailed: "The proposal could not be generated.",
  },
}

export type ErrorKey = keyof typeof Errors
export type ErrorMessage = string

export function getError(category: keyof typeof Errors, key: string): string {
  return Errors[category]?.[key as keyof typeof Errors[keyof typeof Errors]] || "An unexpected error occurred."
}
