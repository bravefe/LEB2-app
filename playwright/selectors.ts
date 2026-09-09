export const selectors = {
  classCards: ".class-card[name^=\"card-\"]",
  classIdAttribute: "name",
  classUrlAttribute: "data-url",
  classCode: "[name=code]",
  className: "[name=name_ln]",
  classSection: "[name=section]",
  activityRoot: "activity-list-desktop-student",
  activityRows: "#assessmentListDesktop #table tbody tr",
  activityCandidates: [
    "[data-activity-id]",
    "[data-assessment-id]",
    ".activity-item",
    ".assessment-item",
    ".assessment-list-item",
    "[class*=activity-item]",
    "[class*=assessment-item]"
  ],
  activityTitle: ".assessment__title",
  activityLink: ".assessment__title-link",
  activityCreator: ".assessment__creator",
  activityType: ".badge__assessment-type",
  activityPublishDate: ".tooltip__start-date",
  activityDueDate: ".tooltip__due-date",
  activityStatus: ".badge__submit-status",
  activityAttachment: ".assessment__download-attachments",
  emptyActivityText: /no (assessment )?activities|no activities/i
} as const;
