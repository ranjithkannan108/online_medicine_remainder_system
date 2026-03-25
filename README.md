EmailJS Setup – Medicine Reminder System
Enable automated email alerts for missed doses and low stock notifications.

Steps:

Create Email Service – Connect Gmail/Outlook in EmailJS and copy the Service ID.

Create Template – Add variables ({{to_name}}, {{subject}}, {{message}}, {{medicine_name}}) and copy the Template ID.

Get Public Key – From Account > API Keys.

Configure Project – Update src/main/webapp/js/config.js with your keys:
