
Medicine Reminder System



A full-stack web application designed to help users manage their medication schedules effectively. Built with a Java backend and a modern responsive frontend, it ensures timely reminders, stock tracking, and compliance monitoring.
======================================================================
before use the web page done this steps
====================================================================
Calendar Alarm Guide - Medicine Reminder System
The "Set Alarm" feature allows you to sync your medicine schedule directly with your personal calendar (Google Calendar, Outlook, Apple Calendar, etc.).

How to Set an Alarm:
Go to Dashboard: Log in and visit your 📊 Dashboard.
Locate Reminder: Find the medication under "Today's Reminders".
Click "Set Alarm": Click the 📅 Set Alarm button next to the medicine you want to sync.
Download File: A small file named MedReminder_MedicineName_Time.ics will be downloaded to your device.
Open & Import:
On Mobile: Tap the file; your phone will ask to add it to your Calendar app.
On Desktop: Double-click the file to open it in Outlook or Apple Calendar, or "Import" it into your Google Calendar.
Confirm: Save the event. You now have a native calendar alarm for that dose!









EmailJS Setup – Medicine Reminder System
Enable automated email alerts for missed doses and low stock notifications.

Steps:

Create Email Service – Connect Gmail/Outlook in EmailJS and copy the Service ID.

Create Template – Add variables ({{to_name}}, {{subject}}, {{message}}, {{medicine_name}}) and copy the Template ID.

Get Public Key – From Account > API Keys.

Configure Project – Update src/main/webapp/js/config.js with your keys:
