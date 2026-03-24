export const fallbackMessages = {
  loginSuccess: "Welcome to Spare Space Admin Panel",
  logoutSuccess: "You have been logged out successfully.",
  updatePWDSuccess: "Password updated successfully",
  updateProfileSuccess: "Profile updated successfully",

  userCSVExportSuccess: "File downloaded successfully",
  userToggleState: (active: boolean) =>
    `User is now ${active ? "Active" : "Inactive"}`,

  deleteReviewSuccess: `The review has been removed from the platform.`,

  propertyApprovalSuccess: "Property approved successfully",
  propertyUpdateSuccess: "Property details updated successfully",

  notificationSendSuccess: {
    title: "Notification sent",
    desc: "Your notification has been sent successfully.",
  },

  validationError: "Please check the entered data and try again.",
  unauthorizedError: "You are not authorized to perform this action.",
  forbiddenError: "Access to this resource is forbidden.",
  notFoundError: "The requested resource was not found.",
  serverError: "Server error. Please try again later.",
  networkError: "Network error. Please check your internet connection.",
  genericError: "An unexpected error occurred. Please try again later.",

  imageSizeError: "Image size should be less than 5MB",
};
