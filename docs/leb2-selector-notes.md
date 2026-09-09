# LEB2 selector notes

## Confirmed from the supplied class-list HTML

- Class card: `.class-card[name^="card-"]`
- Class ID: numeric suffix of the card `name`, for example `card-1583085`
- Class access URL: card `data-url`
- Course code: `[name="code"]`
- Course name: `[name="name_ln"]`
- Section: `[name="section"]`
- Semester selector: links under the semester dropdown, `a[href*="semester_id="]`

The scanner uses the class ID to visit the predictable activity URL:
`https://app.leb2.org/class/{classId}/activity`.

## Confirmed from the supplied rendered activity HTML

- Activity row: `#assessmentListDesktop #table tbody tr`
- Activity title: `.assessment__title`
- Activity URL: `.assessment__title-link[href]`
- Creator: `.assessment__creator`
- Assignment type: `.badge__assessment-type`
- Publish date: `.tooltip__start-date`
- Due date: `.tooltip__due-date`
- Submission status: `.badge__submit-status`
- Attachments: `.assessment__download-attachments`

The title is inside each table row, for example:

```html
<span class="assessment__title">Facebook Group (updated)</span>
```

The parser fixture currently validates five activity rows from the supplied page, including activities with no due date, submitted status, group type, quiz URLs, and attachments.

Do not paste passwords, cookies, CSRF tokens, JWTs, email addresses, student IDs, grades, comments, or classmate details.
