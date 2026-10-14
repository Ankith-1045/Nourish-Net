# NourishNet: Smart Food Redistribution Platform

## Project Report

### 1. Introduction

NourishNet is a web-based food redistribution platform that connects food donors with NGOs and people in need. Restaurants, hotels, supermarkets, events, and households can donate surplus food through the platform. NGOs can request food and distribute it to communities.

The purpose of NourishNet is to reduce food wastage and improve the delivery of surplus food to people who need it. The system uses location, food type, quantity, urgency, and expiry time to recommend suitable NGOs for each donation.

### 2. Problem Statement

Large amounts of edible food are wasted every day, while many people do not have reliable access to food. Donors and NGOs may also find it difficult to communicate, coordinate transportation, track donations, and distribute food before it expires.

NourishNet provides one platform for donation, NGO requests, matching, tracking, inventory management, notifications, and reporting.

### 3. Objectives

- Reduce edible food wastage.
- Connect food donors with verified NGOs.
- Match donations with NGOs based on need and location.
- Track donations from submission to distribution.
- Notify users about updates and expiry dates.
- Maintain inventory records.
- Provide dashboards and reports.

### 4. Users of the System

**Donor:** Registers, adds food donations, uploads details and images, and tracks donation status.

**NGO:** Registers, submits food requests, specifies urgency and quantity, accepts suitable donations, and updates distribution information.

**Administrator:** Verifies users and NGOs, manages donations and requests, monitors inventory, views reports, and maintains records.

### 5. Main Modules

1. **User Authentication:** Registration, login, password protection, and role-based access.
2. **Donation Management:** Adding, editing, tracking, and updating food donations.
3. **NGO Request Management:** NGOs can submit food requirement requests.
4. **Smart NGO Recommendation:** Matching by food category, urgency, expiry, quantity, capacity, and location.
5. **Allocation Management:** Reserving and allocating donations.
6. **Inventory Management:** Recording available, reserved, allocated, expired, and distributed food.
7. **Notification System:** Updates and expiry warnings.
8. **Analytics and Reports:** Donation activity, distribution information, and social impact.
9. **Audit Logs:** Records of important actions.

### 6. Technology Used

**Frontend:** React, Vite, HTML, CSS, and JavaScript.

**Backend:** Node.js, Express.js, MongoDB, and Mongoose.

**Supporting tools:** JSON Web Tokens, bcrypt, Express Validator, Helmet, Cloudinary, Swagger, Jest, Supertest, and Docker.

### 7. System Workflow

1. A donor registers and logs in.
2. The donor submits surplus food details.
3. NGOs submit their food requirements and urgency.
4. The system compares donations with NGO requirements.
5. NourishNet recommends suitable verified NGOs.
6. An NGO accepts the donation and the food is allocated.
7. The donation is tracked through pickup, delivery, and distribution.
8. Inventory and notifications are updated.
9. Administrators monitor the process from the dashboard.

### 8. Smart Recommendation System

The recommendation system considers food category, NGO demand, urgency, expiry time, quantity, capacity, and distance. This reduces delays and improves the chance that food reaches people before it expires.

### 9. Advantages

- Reduces food wastage.
- Supports communities in need.
- Improves donor-NGO coordination.
- Provides transparent tracking.
- Helps NGOs receive suitable food.
- Provides useful dashboards and reports.
- Encourages sustainable food management.

### 10. Future Scope

- Mobile applications for donors and NGOs.
- Live GPS tracking for pickups and deliveries.
- Communication between donors and NGOs.
- Improved AI recommendations.
- Integration with food banks and government programs.
- Multi-language support.
- Volunteer and delivery management.
- Detailed environmental impact calculations.

### 11. Conclusion

NourishNet is a practical web application designed to reduce food wastage and improve food distribution. It brings donors, NGOs, and administrators together on one platform. By combining donation management, smart recommendations, inventory tracking, notifications, and analytics, the project provides an efficient and transparent method for redistributing surplus food.

The project demonstrates how web technology can address a real social problem and support sustainable community development.
