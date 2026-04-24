# SwiftFlow Prototype Documentation

## 1. Prototype Name
SwiftFlow

## 2. Prototype Summary
SwiftFlow is a smart commuter prototype designed for cross-border travelers moving between Johor and Singapore. It combines transport booking, passport pre-check readiness, live alerts, QR travel passes, and green reward incentives into one mobile-first experience.

The goal of the prototype is to reduce travel friction by helping users:
- plan their trip
- confirm transport options
- manage border-readiness tasks
- access QR passes quickly
- respond to alerts and route changes
- track sustainable mobility rewards

## 3. Problem Statement
Cross-border commuters often need to manage several disconnected steps:
- choosing transport
- monitoring traffic and congestion
- preparing travel documents
- accessing ticket or pass details quickly
- switching to fallback transport when disruptions happen

This creates stress, uncertainty, and delays, especially near the checkpoint.

SwiftFlow addresses this by centralizing the commuter journey into one guided workflow.

## 4. Prototype Objectives
The prototype is built to demonstrate how a single mobility app can:
- simplify Johor-Singapore travel planning
- improve readiness before checkpoint arrival
- reduce time lost to congestion and confusion
- support fallback decisions across RTS, bus, and taxi pool
- encourage greener travel behavior through credits and rewards

## 5. Target Users
Primary users:
- daily cross-border commuters
- students traveling between Johor and Singapore
- workers commuting to Singapore
- occasional travelers needing a simpler travel flow

Secondary users:
- travelers unfamiliar with the border process
- users who want fallback transport and document reminders in one place

## 6. Key Prototype Features

### 6.1 Explore Page
The Explore page acts as the main trip planning dashboard.

It shows:
- selected trip route
- departure timing
- estimated arrival
- access to RTS booking
- access to passport pre-check
- quick links to bus and taxi pool alternatives

### 6.2 RTS Booking
Users can:
- view RTS trip details
- confirm the RTS booking
- see updated payment and confirmation status
- compare alternatives if needed
- open the relevant QR pass from the profile flow

### 6.3 Bus Booking
Users can:
- review bus route details
- confirm bus booking
- see updated confirmation and payment state
- access the related QR pass
- use bus as a fallback mobility option

### 6.4 Taxi Pool / Carpool
Users can:
- browse mock carpool drivers
- select a driver
- reserve a shared ride
- view pickup route details
- open the pickup map

### 6.5 Passport Pre-Check
This page helps users prepare border-readiness tasks.

It includes:
- passport validity status
- SGAC / MDAC status
- visa requirement summary
- readiness guidance
- access to the QR bar after submission

The prototype now treats pre-check timing as:
- 30 minutes before checkpoint or destination arrival
- not 30 minutes before leaving home

### 6.6 Document Readiness
This section simulates digital arrival card workflows:
- SG Arrival Card
- Malaysia Digital Arrival Card

Submission states include:
- Not Submitted
- Syncing with ICA/MDAC Databases
- Verifying Biometric Token
- Submission Confirmed

### 6.7 Profile Page
The profile page acts as a compact travel wallet.

It includes:
- user profile
- editable profile details
- profile picture upload
- current bookings
- trip history
- QR pass display
- passport QR bar display when eligible

### 6.8 Alerts and Notifications
SwiftFlow supports contextual alert concepts such as:
- congestion warnings
- pre-check reminders
- carbon reward achievements
- route comparisons

These alerts are designed to guide the user to the most relevant next action.

### 6.9 Credits and Rewards
Users earn credits for lower-emission travel choices.

The prototype includes:
- green credits dashboard
- reward redemption flow
- sustainability-focused mobility incentives

## 7. User Flow Overview

### Main flow
1. User lands on Explore.
2. User selects destination and departure context.
3. User confirms RTS, bus, or taxi pool option.
4. User completes passport or document readiness.
5. User opens a QR pass in Profile.
6. User receives alerts, reminders, and route support.
7. User earns credits and redeems rewards.

### Fallback flow
1. Primary route faces congestion or change.
2. User receives an alert.
3. User reviews an alternative route.
4. User switches to bus or taxi pool if needed.

## 8. Prototype Pages
The current prototype includes these major pages:
- Explore
- RTS Booking
- Bus Booking
- Taxi Pool Booking
- Pickup Map
- Passport Pre-Check
- Document Readiness
- Alerts
- Notifications
- Credits
- Rewards
- Profile

## 9. Technical Architecture

### Frontend
- Vite
- Vanilla JavaScript
- modular page rendering
- mobile-first UI

### Backend
- Node.js
- API-driven state sync
- route handlers for booking, profile, credits, alerts, and tasks

### Cloud / Platform
- Google Cloud Run
- Cloud Build
- Cloud Scheduler
- Cloud Tasks

### Firebase
- Firebase Authentication
- Firestore
- Firebase Storage

### External Services
- Google Maps / Places / Routes integration
- translation-ready architecture
- AI-ready recommendation and alert flow

## 10. Data Model Highlights
The prototype state includes:
- active tab or page state
- booking state
- bus booking state
- carpool booking state
- profile details
- trip history
- reward balance
- alert state
- document submission state
- QR pass readiness state

## 11. Prototype Assumptions
This prototype currently uses a mix of:
- real frontend and backend architecture
- simulated trip logic
- mock payment states
- mock arrival-card progression
- prototype-friendly route and pass behaviors

It is intended to validate the product concept and user journey rather than serve as a production transport system.

## 12. What Makes This Prototype Valuable
SwiftFlow is valuable because it combines multiple stressful travel steps into a single guided experience:
- trip planning
- transport confirmation
- checkpoint readiness
- fallback route handling
- QR access
- sustainability incentives

This makes the prototype stronger than a simple ticket-booking demo because it addresses the broader commuter journey.

## 13. Current Prototype Strengths
- clear commuter workflow
- strong mobile-first presentation
- multi-modal transport support
- profile as travel wallet
- document readiness integration
- route fallback concept
- sustainability angle
- deployable cloud architecture

## 14. Current Limitations
As a prototype, SwiftFlow still has limitations:
- some data flows are simulated
- notifications are prototype-triggered rather than fully real-time
- transport integrations are not connected to live operators
- document submission is mocked
- exact border system integrations are not yet connected end-to-end

## 15. Future Development Opportunities
Potential next steps:
- live checkpoint traffic integrations
- real operator booking APIs
- production-grade passport or arrival-card integration
- multilingual UI translation
- push notifications
- user personalization
- richer route optimization
- deeper sustainability analytics
- production-ready IAM and monitoring setup

## 16. Prototype Conclusion
SwiftFlow demonstrates how cross-border commuter travel can be made more seamless, responsive, and user-friendly through a unified mobility wallet. The prototype brings together bookings, alerts, border readiness, digital passes, and green rewards into one connected experience designed for real-world commuter pain points.
