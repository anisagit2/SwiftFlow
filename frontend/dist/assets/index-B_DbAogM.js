(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))t(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&t(o)}).observe(document,{childList:!0,subtree:!0});function i(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function t(n){if(n.ep)return;n.ep=!0;const s=i(n);fetch(n.href,s)}})();const h=()=>({activeTab:"explore",countdownSeconds:28*60+42,checkInAccepted:!1,passReady:!1,routeMode:"RTS Link",routeGate:"Gate B22",routeWindow:"14:45 - 15:15",alertAccepted:!1,balance:2450,rank:"Top 5%",ecoSaved:"12.4kg",goalCredits:3e3,locationOptions:["Bukit Chagar, Johor","Larkin Sentral, Johor","Tebrau, Johor","Skudai, Johor","Woodlands North, Singapore","Woodlands Checkpoint, Singapore","Jurong East, Singapore","Orchard, Singapore","Marina Bay, Singapore"],trainTimeOptions:["09:15","09:45","10:15","10:45"],busTimeOptions:["10:10","10:25","10:40","11:00"],carpoolPaymentOptions:["Cash","Visa","Touch 'n Go eWallet","Mastercard","Other"],trainPaymentOptions:["Visa","Touch 'n Go eWallet","Mastercard","Apple Pay","Other"],busPaymentOptions:["Cash","Visa","Touch 'n Go eWallet","Mastercard","Other"],booking:{origin:"Bukit Chagar, Johor",destination:"Woodlands North, Singapore",departureTime:"09:45",arrivalTime:"10:00",estimatedBorderArrival:"10:18",platform:"Platform 2",paymentMethod:"Visa",fare:"RM 16.00",status:"Booked RTS"},busBooking:{route:"CW2 Causeway Bus",origin:"Bukit Chagar, Johor",destination:"Woodlands Checkpoint, Singapore",departureTime:"10:25",arrivalTime:"11:05",estimatedBorderArrival:"11:18",paymentMethod:"Touch 'n Go eWallet",fare:"RM 4.50",status:"Backup bus"},carpoolDrivers:[{id:"driver-1",name:"Afiq Hassan",car:"Toyota Veloz",seats:"2 seats left",departureTime:"10:05",destination:"Woodlands North, Singapore",pickupSpot:"Komtar JBCC pickup bay A",pickupEta:"7 min walk",price:"RM 19.00",credits:"+28 credits",hovLane:"Green lane eligible",paymentMethod:"Visa"},{id:"driver-2",name:"Mei Lin",car:"Hyundai Stargazer",seats:"3 seats left",departureTime:"10:20",destination:"Orchard, Singapore",pickupSpot:"Bukit Chagar shared ride point",pickupEta:"4 min walk",price:"RM 21.00",credits:"+30 credits",hovLane:"Green lane eligible",paymentMethod:"Cash"},{id:"driver-3",name:"Ravi Kumar",car:"Honda BR-V",seats:"2 seats left",departureTime:"10:35",destination:"Marina Bay, Singapore",pickupSpot:"CIQ South carpool gate",pickupEta:"9 min walk",price:"RM 22.50",credits:"+32 credits",hovLane:"Green lane eligible",paymentMethod:"Touch 'n Go eWallet"}],selectedCarpoolDriverId:"driver-1",rewards:[{id:"parking",name:"Free RTS Parking",cost:500,description:"4 hours of complimentary parking at any RTS linked station."},{id:"scooter",name:"Scooter Unlock Pack",cost:350,description:"Waive the unlock fee for your next 10 micro-mobility rides."},{id:"coffee",name:"Organic Coffee Bean",cost:200,description:"Redeem a large specialty coffee from Green Grounds partner cafes."},{id:"weekly-pass",name:"Weekly Bus Pass",cost:1800,description:"Unlimited travel on green-line electric buses for 7 days."}],recentCredits:[{title:"Verified Carpool",detail:"Shared ride with 3 commuters",amount:50,time:"2 hours ago",icon:"directions_car"},{title:"Off-Peak RTS",detail:"Rapid transit during low traffic",amount:20,time:"Yesterday",icon:"train"},{title:"E-Bike Commute",detail:"8km emission-free journey",amount:35,time:"3 days ago",icon:"pedal_bike"},{title:"Weekly Streak",detail:"5 days of green commuting",amount:100,time:"4 days ago",icon:"verified"}]}),p=a=>a.carpoolDrivers.find(e=>e.id===a.selectedCarpoolDriverId)??a.carpoolDrivers[0],y=a=>Math.min(100,a.balance/a.goalCredits*100),k=a=>a.activeTab==="alerts"?"Live Alerts":a.activeTab==="booking"?"RTS Booking":a.activeTab==="bus-booking"?"Bus Booking":a.activeTab==="carpool-booking"?"Taxi Carpool":a.activeTab==="credits"?"Green Credits":a.activeTab==="rewards"?"Rewards Marketplace":a.activeTab==="profile"?"Profile":"SwiftFlow JSIC",b=a=>{const e=Math.max(0,a),i=String(Math.floor(e/60)).padStart(2,"0"),t=String(e%60).padStart(2,"0");return`${i}:${t}`},d=(a,e)=>{const[i,t]=a.split(":").map(Number),s=((i*60+t+e)%(24*60)+24*60)%(24*60),o=String(Math.floor(s/60)).padStart(2,"0"),l=String(s%60).padStart(2,"0");return`${o}:${l}`},m=a=>{a.booking.arrivalTime=d(a.booking.departureTime,15),a.booking.estimatedBorderArrival=d(a.booking.arrivalTime,18),a.busBooking.arrivalTime=d(a.busBooking.departureTime,40),a.busBooking.estimatedBorderArrival=d(a.busBooking.arrivalTime,18)},g=(a,e)=>{a.activeTab=e},f=a=>{a.checkInAccepted||(a.checkInAccepted=!0,a.passReady=!0,a.balance+=120,a.recentCredits.unshift({title:"Priority QR Check-In",detail:"Accepted low-volume border window",amount:120,time:"Just now",icon:"qr_code_2"})),a.activeTab="booking"},w=a=>{a.alertAccepted=!0,a.checkInAccepted=!0,a.passReady=!0,a.routeMode="RTS Link",a.routeGate="North Bridge RTS Transfer",a.routeWindow="10:15 - 10:45",a.balance+=80,a.activeTab="explore"},$=a=>{a.activeTab="profile"},T=(a,e)=>{const i=a.rewards.find(t=>t.id===e);!i||a.balance<i.cost||(a.balance-=i.cost,a.recentCredits.unshift({title:`Redeemed ${i.name}`,detail:"Marketplace redemption completed",amount:-i.cost,time:"Just now",icon:"redeem"}),a.activeTab="credits")},S=(a,e)=>{a.selectedCarpoolDriverId=e},B=(a,e)=>{a.booking.destination=e,a.busBooking.destination=e,a.routeGate=e.includes("Woodlands")?"Gate B22":"Gate C14",a.routeWindow=`${a.booking.departureTime} - ${a.booking.arrivalTime}`},C=(a,e)=>{a.booking.origin=e,a.busBooking.origin=e},R=(a,e)=>{a.busBooking.origin=e},P=(a,e)=>{a.booking.departureTime=e,m(a),a.routeWindow=`${a.booking.departureTime} - ${a.booking.arrivalTime}`},_=(a,e)=>{a.busBooking.departureTime=e,m(a)},O=(a,e)=>{a.booking.paymentMethod=e},M=(a,e)=>{a.busBooking.paymentMethod=e},A=(a,e)=>{p(a).paymentMethod=e},r=(a,e)=>a.map(i=>`<option value="${i}" ${i===e?"selected":""}>${i}</option>`).join(""),c=(a,e,i,t)=>`
    <button class="nav-item ${a===e?"nav-item--active":""}" data-nav="${e}">
        <span class="material-symbols-outlined ${a===e?"filled":""}">${i}</span>
        <span>${t}</span>
    </button>
`,x=(a,e)=>`
    <div class="page-shell">
        <header class="topbar">
            <button class="brand" data-nav="explore">
                <span class="material-symbols-outlined filled">directions_transit</span>
                <span>${k(a)}</span>
            </button>
            <div class="topbar-actions">
                <div class="credit-badge">
                    <span class="material-symbols-outlined filled">eco</span>
                    <span>${a.balance.toLocaleString()}</span>
                </div>
                <button class="icon-button" aria-label="Open alerts" data-nav="alerts">
                    <span class="material-symbols-outlined">notifications</span>
                </button>
                <div class="avatar">HF</div>
            </div>
        </header>

        <main class="page-content">
            ${e}
        </main>
    </div>

    <nav class="bottom-nav">
        ${c(a.activeTab,"explore","explore","Explore")}
        ${c(a.activeTab,"alerts","notifications_active","Alerts")}
        ${c(a.activeTab,"credits","eco","Credits")}
        ${c(a.activeTab,"rewards","redeem","Rewards")}
        ${c(a.activeTab,"profile","person","Profile")}
    </nav>
`,L=a=>`
    <section class="hero-card hero-card--alert">
        <div class="hero-copy">
            <div class="pill pill--danger">
                <span class="material-symbols-outlined filled">warning</span>
                <span>Incident detected</span>
            </div>
            <h1>Slot shifting keeps traffic from peaking.</h1>
            <p>
                A major accident at the North Bridge crossing and heavy rain risk near Downtown are both increasing road pressure.
                SwiftFlow can proactively shift your border slot and move you toward RTS Link before congestion spikes.
            </p>
        </div>
    </section>

    <section class="grid-two">
        <article class="panel map-panel">
            <div class="map-marker">
                <span class="material-symbols-outlined filled">car_crash</span>
            </div>
            <div class="map-caption">North Bridge Transit Zone</div>
        </article>

        <article class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Priority window</span>
                    <h2>Schedule Shift</h2>
                </div>
                <strong class="trend-up">+45m</strong>
            </div>
            <div class="shift-row">
                <div>
                    <small>Original</small>
                    <div class="strike">09:30</div>
                </div>
                <div class="shift-arrow">
                    <span class="material-symbols-outlined">trending_flat</span>
                </div>
                <div class="shift-new">
                    <small>New window</small>
                    <div>10:15</div>
                </div>
            </div>
            <div class="mini-stat">
                <span class="material-symbols-outlined filled">eco</span>
                <div>
                    <strong>38 mins idling saved</strong>
                    <p>2.4kg CO2 emissions prevented by avoiding gridlock.</p>
                </div>
            </div>
            <div class="stack-actions">
                <button class="primary-action" data-action="accept-alert">
                    <span>${a.alertAccepted?"Slot shift accepted":"Accept New Slot"}</span>
                    <span class="material-symbols-outlined">check_circle</span>
                </button>
                <button class="secondary-action" data-action="switch-tab" data-target="explore">View alternative routes</button>
            </div>
        </article>
    </section>

    <section class="grid-two">
        <article class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Weather traffic intelligence</span>
                    <h2>Heavy rain expected: 2:00 PM</h2>
                </div>
                <span class="material-symbols-outlined accent">cloud</span>
            </div>
            <p>Flash floods are predicted in Downtown transit corridors. AI speed forecasts show road traffic could drop from 65 km/h to 15 km/h.</p>
            <div class="forecast-row">
                <div>
                    <small>Predicted</small>
                    <strong class="danger-text">15 km/h</strong>
                </div>
                <div>
                    <small>Current</small>
                    <strong>65 km/h</strong>
                </div>
            </div>
            <div class="progress-bar">
                <span style="width:23%"></span>
            </div>
        </article>

        <article class="panel panel--promo">
            <span class="eyebrow">Limited event</span>
            <h2>2x Green Credits</h2>
            <p>Beat the storm. Secure your RTS Link ticket now and double your environmental impact rewards before the gridlock starts.</p>
            <button class="primary-action primary-action--light" data-action="accept-checkin">
                <span>Secure RTS Slot</span>
                <span class="material-symbols-outlined">bolt</span>
            </button>
        </article>
    </section>
`,W=a=>`
    <section class="hero-card hero-card--bus">
        <div class="hero-copy">
            <div class="booking-head">
                <button class="back-chip" data-nav="explore">
                    <span class="material-symbols-outlined">arrow_back</span>
                    <span>Back</span>
                </button>
                <div class="pill">
                    <span class="material-symbols-outlined filled">directions_bus</span>
                    <span>${a.busBooking.status}</span>
                </div>
            </div>
            <h1>${a.busBooking.departureTime} bus to ${a.busBooking.destination}</h1>
            <p>This bus page mirrors the train detail flow so users can compare destination, timing, and payment before switching.</p>
        </div>
    </section>

    <section class="grid-two">
        <article class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Bus ticket</span>
                    <h2>Departure details</h2>
                </div>
                <span class="material-symbols-outlined accent">directions_bus</span>
            </div>
            <div class="selector-grid">
                <label class="field-card">
                    <small>From</small>
                    <select data-field="bus-origin">${r(a.locationOptions,a.busBooking.origin)}</select>
                </label>
                <label class="field-card">
                    <small>To</small>
                    <select data-field="destination">${r(a.locationOptions,a.busBooking.destination)}</select>
                </label>
                <label class="field-card">
                    <small>Bus time</small>
                    <select data-field="bus-time">${r(a.busTimeOptions,a.busBooking.departureTime)}</select>
                </label>
            </div>
            <div class="ticket-grid">
                <div class="ticket-stat">
                    <small>Origin</small>
                    <strong>${a.busBooking.origin}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Destination</small>
                    <strong>${a.busBooking.destination}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Departure time</small>
                    <strong>${a.busBooking.departureTime}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Arrival time</small>
                    <strong>${a.busBooking.arrivalTime}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Route</small>
                    <strong>${a.busBooking.route}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Border ETA</small>
                    <strong>${a.busBooking.estimatedBorderArrival}</strong>
                </div>
            </div>
        </article>

        <article class="panel panel--bus-ticket">
            <span class="eyebrow">Payment</span>
            <h2>${a.busBooking.fare}</h2>
            <p>Choose how the bus fare should be charged if you switch from RTS to the checkpoint bus.</p>
            <div class="payment-list">
                <label class="field-card field-card--payment">
                    <small>Payment method</small>
                    <select data-field="bus-payment">${r(a.busPaymentOptions,a.busBooking.paymentMethod)}</select>
                </label>
                <div class="payment-row">
                    <small>Method</small>
                    <strong>${a.busBooking.paymentMethod}</strong>
                </div>
                <div class="payment-row">
                    <small>Ticket type</small>
                    <strong>Checkpoint express bus</strong>
                </div>
                <div class="payment-row">
                    <small>Status</small>
                    <strong>Ready to charge after booking</strong>
                </div>
            </div>
            <button class="primary-action primary-action--light" data-nav="booking">
                <span>Compare with RTS</span>
                <span class="material-symbols-outlined">compare_arrows</span>
            </button>
        </article>
    </section>

    <section class="panel panel--notice">
        <div>
            <span class="eyebrow">Fallback mode</span>
            <h3>Bus remains available</h3>
            <p>The bus option keeps the same destination context as Explore, so users can adjust destination and time without losing the rest of the trip plan.</p>
        </div>
        <div class="notice-actions">
            <button class="secondary-action" data-nav="explore">Return to explore</button>
            <button class="secondary-action" data-nav="alerts">Check alerts</button>
        </div>
    </section>
`,D=a=>{const e=p(a);return`
        <section class="hero-card hero-card--carpool">
            <div class="hero-copy">
                <div class="booking-head">
                    <button class="back-chip" data-nav="explore">
                        <span class="material-symbols-outlined">arrow_back</span>
                        <span>Back</span>
                    </button>
                    <div class="pill">
                        <span class="material-symbols-outlined filled">local_taxi</span>
                        <span>Taxi Carpool</span>
                    </div>
                </div>
                <h1>${e.departureTime} carpool to ${e.destination}</h1>
                <p>Choose a driver leaving at a specific time, share with 2 or 3 riders, use the HOV green lane, and still earn commuter credits.</p>
            </div>
        </section>

        <section class="grid-two">
            <article class="panel">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Available drivers</span>
                        <h2>Taxi list</h2>
                    </div>
                    <span class="material-symbols-outlined accent">list_alt</span>
                </div>
                <div class="driver-list">
                    ${a.carpoolDrivers.map(i=>`
                        <button class="driver-card ${i.id===a.selectedCarpoolDriverId?"driver-card--active":""}" data-action="select-driver" data-driver="${i.id}">
                            <div>
                                <h4>${i.name}</h4>
                                <p>${i.car} • ${i.seats}</p>
                            </div>
                            <div class="driver-meta">
                                <strong>${i.departureTime}</strong>
                                <span>${i.destination}</span>
                            </div>
                        </button>
                    `).join("")}
                </div>
            </article>

            <article class="panel panel--carpool-ticket">
                <span class="eyebrow">Selected ride</span>
                <h2>${e.price}</h2>
                <p>${e.hovLane} and ${e.credits} for shared border travel.</p>
                <div class="payment-list">
                    <label class="field-card field-card--payment">
                        <small>Payment method</small>
                        <select data-field="carpool-payment">${r(a.carpoolPaymentOptions,e.paymentMethod)}</select>
                    </label>
                    <div class="payment-row">
                        <small>Driver</small>
                        <strong>${e.name}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Seats left</small>
                        <strong>${e.seats}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Status</small>
                        <strong>Charge after driver selection</strong>
                    </div>
                </div>
            </article>
        </section>

        <section class="grid-two">
            <article class="panel carpool-map-panel">
                <div class="map-pin">
                    <span class="material-symbols-outlined filled">place</span>
                </div>
                <div class="map-caption">${e.pickupSpot}</div>
            </article>

            <article class="panel">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Pickup route</span>
                        <h2>Go to the pickup spot</h2>
                    </div>
                    <span class="material-symbols-outlined accent">map</span>
                </div>
                <div class="ticket-grid">
                    <div class="ticket-stat">
                        <small>From</small>
                        <strong>${a.booking.origin}</strong>
                    </div>
                    <div class="ticket-stat">
                        <small>To</small>
                        <strong>${e.destination}</strong>
                    </div>
                    <div class="ticket-stat">
                        <small>Pickup spot</small>
                        <strong>${e.pickupSpot}</strong>
                    </div>
                    <div class="ticket-stat">
                        <small>Walk ETA</small>
                        <strong>${e.pickupEta}</strong>
                    </div>
                    <div class="ticket-stat">
                        <small>Departure time</small>
                        <strong>${e.departureTime}</strong>
                    </div>
                    <div class="ticket-stat">
                        <small>Lane access</small>
                        <strong>${e.hovLane}</strong>
                    </div>
                </div>
            </article>
        </section>
    `},G=a=>`
    <section class="hero-card hero-card--credits">
        <div class="hero-orb hero-orb--blue"></div>
        <div class="hero-copy">
            <span class="eyebrow eyebrow--light">Current balance</span>
            <h1>${a.balance.toLocaleString()}</h1>
            <p>Credits are earned when you flatten peak demand, shift to RTS Link or bus, and choose lower-emission border journeys.</p>
            <div class="metric-grid">
                <div class="metric-card">
                    <small>Eco saving</small>
                    <strong>${a.ecoSaved}</strong>
                </div>
                <div class="metric-card">
                    <small>Rank</small>
                    <strong>${a.rank}</strong>
                </div>
            </div>
        </div>
    </section>

    <section class="grid-two">
        <article class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Goal</span>
                    <h2>Urban Pioneer progress</h2>
                </div>
                <span class="material-symbols-outlined accent">trophy</span>
            </div>
            <p>${Math.max(0,a.goalCredits-a.balance)} credits away from premium commuter status.</p>
            <div class="goal-bar">
                <span style="width:${y(a)}%"></span>
            </div>
            <div class="goal-foot">
                <span>${a.balance.toLocaleString()} current</span>
                <span>${a.goalCredits.toLocaleString()} target</span>
            </div>
        </article>

        <article class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Reward use</span>
                    <h2>Why credits matter</h2>
                </div>
                <span class="material-symbols-outlined accent">redeem</span>
            </div>
            <p>Credits can be redeemed for local shopping, parking, and transit benefits, creating a direct incentive to leave more cars off the road.</p>
            <button class="secondary-action" data-nav="rewards">Visit marketplace</button>
        </article>
    </section>

    <section class="panel">
        <div class="section-head">
            <div>
                <span class="eyebrow">Recent earnings</span>
                <h2>Credit activity</h2>
            </div>
        </div>
        <div class="earnings-list">
            ${a.recentCredits.map(e=>`
                <article class="earning-card">
                    <div class="earning-icon">
                        <span class="material-symbols-outlined">${e.icon}</span>
                    </div>
                    <div class="earning-copy">
                        <h4>${e.title}</h4>
                        <p>${e.detail}</p>
                        <small>${e.time}</small>
                    </div>
                    <div class="earning-value">+${e.amount}</div>
                </article>
            `).join("")}
        </div>
    </section>
`,E=a=>{const e=p(a);return`
        <section class="hero-card hero-card--explore">
            <div class="hero-orb hero-orb--green"></div>
            <div class="hero-copy">
                <div class="pill">
                    <span class="material-symbols-outlined filled">bolt</span>
                    <span>${a.booking.status}</span>
                </div>
                <h1>Your border trip is lined up.</h1>
                <p>
                    SwiftFlow now shows your selected destination, booked RTS departure, estimated border arrival,
                    and backup bus and carpool options so you can move through the Johor-Singapore crossing with less uncertainty.
                </p>
                <div class="hero-actions">
                    <button class="primary-action" data-nav="booking">
                        <span>View RTS Booking</span>
                        <span class="material-symbols-outlined">arrow_forward</span>
                    </button>
                    <div class="stat-pill">
                        <span class="material-symbols-outlined">timer</span>
                        <div>
                            <small>Estimated arrival</small>
                            <strong>${a.booking.estimatedBorderArrival}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="grid-two">
            <article class="panel">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Selected trip</span>
                        <h2>${a.booking.origin} to ${a.booking.destination}</h2>
                    </div>
                    <span class="material-symbols-outlined accent">route</span>
                </div>
                <div class="selector-grid">
                    <label class="field-card">
                        <small>From</small>
                        <select data-field="origin">${r(a.locationOptions,a.booking.origin)}</select>
                    </label>
                    <label class="field-card">
                        <small>To</small>
                        <select data-field="destination">${r(a.locationOptions,a.booking.destination)}</select>
                    </label>
                    <label class="field-card">
                        <small>RTS time</small>
                        <select data-field="train-time">${r(a.trainTimeOptions,a.booking.departureTime)}</select>
                    </label>
                </div>
                <div class="trip-summary">
                    <div class="trip-summary__block">
                        <small>From</small>
                        <strong>${a.booking.origin}</strong>
                    </div>
                    <div class="trip-summary__block">
                        <small>To</small>
                        <strong>${a.booking.destination}</strong>
                    </div>
                    <div class="trip-summary__block">
                        <small>Booked departure</small>
                        <strong>${a.booking.departureTime}</strong>
                    </div>
                    <div class="trip-summary__block">
                        <small>Arrival at RTS</small>
                        <strong>${a.booking.arrivalTime}</strong>
                    </div>
                    <div class="trip-summary__block">
                        <small>Border ETA</small>
                        <strong>${a.booking.estimatedBorderArrival}</strong>
                    </div>
                </div>
                <div class="trip-line">
                    <span>${a.booking.origin}</span>
                    <span class="trip-line__arrow material-symbols-outlined">east</span>
                    <span>${a.booking.destination}</span>
                </div>
            </article>

            <article class="panel panel--accent">
                <span class="material-symbols-outlined">train</span>
                <div>
                    <h3>${a.booking.status}</h3>
                    <p>${a.booking.platform} • Priority boarding ready. Your pre-check-in window stays active for ${b(a.countdownSeconds)}.</p>
                </div>
                <div class="impact-chip">
                    <span class="material-symbols-outlined filled">star</span>
                    <span>${a.booking.fare}</span>
                </div>
            </article>
        </section>

        <section class="grid-two">
            <button class="info-card" data-nav="booking">
                <div class="info-card__icon">
                    <span class="material-symbols-outlined">confirmation_number</span>
                </div>
                <div class="info-card__copy">
                    <h4>Booked RTS</h4>
                    <p>${a.booking.departureTime} to ${a.booking.destination} with full ticket and payment details.</p>
                </div>
                <span class="material-symbols-outlined">chevron_right</span>
            </button>

            <button class="info-card" data-nav="bus-booking">
                <div class="info-card__icon">
                    <span class="material-symbols-outlined">directions_bus</span>
                </div>
                <div class="info-card__copy">
                    <h4>${a.busBooking.status}</h4>
                    <p>${a.busBooking.route} at ${a.busBooking.departureTime} arriving ${a.busBooking.arrivalTime}.</p>
                </div>
                <span class="material-symbols-outlined">chevron_right</span>
            </button>
        </section>

        <section class="grid-two">
            <button class="info-card" data-nav="carpool-booking">
                <div class="info-card__icon">
                    <span class="material-symbols-outlined">local_taxi</span>
                </div>
                <div class="info-card__copy">
                    <h4>Taxi Carpool</h4>
                    <p>${e.name} leaves at ${e.departureTime} with ${e.seats} and HOV green lane access.</p>
                </div>
                <span class="material-symbols-outlined">chevron_right</span>
            </button>

            <article class="panel panel--carpool-highlight">
                <span class="material-symbols-outlined">groups</span>
                <div>
                    <h3>Shared taxi, faster lane</h3>
                    <p>Carpool taxis can use the HOV green lane, cost slightly more than bus or train, and still reward users with credits.</p>
                </div>
                <div class="impact-chip">
                    <span class="material-symbols-outlined filled">eco</span>
                    <span>${e.credits}</span>
                </div>
            </article>
        </section>

        <section class="panel panel--notice">
            <div>
                <span class="eyebrow">Travel status</span>
                <h3>${a.booking.departureTime} RTS selected</h3>
                <p>
                    You’ve already selected a destination and confirmed your main train. SwiftFlow keeps bus and taxi carpool visible
                    so you can compare departure time, arrival time, and border reliability without rebooking from scratch.
                </p>
            </div>
            <div class="notice-actions">
                <button class="secondary-action" data-nav="alerts">See incident detail</button>
                <button class="secondary-action" data-nav="booking">Open ticket</button>
            </div>
        </section>
    `},I=a=>`
    <section class="hero-card hero-card--profile">
        <div class="profile-row">
            <div class="profile-avatar">HF</div>
            <div>
                <span class="eyebrow">Commuter profile</span>
                <h1>Howy Flow</h1>
                <p>Johor-Singapore regular commuter using AI slot shifting and RTS incentives.</p>
            </div>
        </div>
    </section>

    <section class="grid-two">
        <article class="panel">
            <span class="eyebrow">Current commute mode</span>
            <h2>${a.routeMode}</h2>
            <p>${a.passReady?`Priority QR active for ${a.routeGate} at ${a.routeWindow}.`:"No active QR pass yet. Accept a predicted low-volume window to activate one."}</p>
        </article>

        <article class="panel">
            <span class="eyebrow">Sustainability summary</span>
            <h2>${a.ecoSaved} CO2 saved</h2>
            <p>Credits and incentives are tied directly to choices that remove cars from the border queue.</p>
        </article>
    </section>

    <section class="grid-two">
        <article class="panel qr-panel">
            <span class="eyebrow">Sample QR pass</span>
            <h2>Priority border pass</h2>
            <div class="qr-sample">
                <div class="qr-grid">
                    ${Array.from({length:49},(e,i)=>`<span class="${[0,1,5,7,8,9,14,15,16,19,21,22,24,26,28,30,31,32,33,35,40,41,42,47,48].includes(i)?"is-dark":""}"></span>`).join("")}
                </div>
            </div>
            <div class="pass-meta-list">
                <div class="payment-row">
                    <small>Code</small>
                    <strong>JSIC-RTS-0284</strong>
                </div>
                <div class="payment-row">
                    <small>Window</small>
                    <strong>${a.routeWindow}</strong>
                </div>
            </div>
        </article>

        <article class="panel">
            <span class="eyebrow">Pass details</span>
            <h2>${a.booking.destination}</h2>
            <p>This sample pass shows the priority QR style users would scan after pre check-in and slot confirmation.</p>
            <div class="payment-list">
                <div class="payment-row">
                    <small>Route</small>
                    <strong>${a.routeMode}</strong>
                </div>
                <div class="payment-row">
                    <small>Departure</small>
                    <strong>${a.booking.departureTime}</strong>
                </div>
                <div class="payment-row">
                    <small>Gate</small>
                    <strong>${a.routeGate}</strong>
                </div>
            </div>
        </article>
    </section>
`,F=a=>`
    <section class="hero-card hero-card--rewards">
        <div class="hero-copy">
            <div class="pill">
                <span class="material-symbols-outlined filled">redeem</span>
                <span>Redeem sustainable value</span>
            </div>
            <h1>Turn border-saving behavior into local benefits.</h1>
            <p>Use your green credits for parking, public transit, shopping, and everyday perks that reinforce lower-emission travel.</p>
        </div>
    </section>

    <section class="grid-two">
        <article class="panel panel--feature">
            <span class="eyebrow">Trending</span>
            <h2>VEP Charge Offset</h2>
            <p>Get 50% off your next Vehicle Entry Permit charge when entering the city core.</p>
            <div class="feature-footer">
                <strong>1,200 credits</strong>
                <button class="primary-action" data-action="redeem" data-reward="weekly-pass">Redeem now</button>
            </div>
        </article>

        <article class="panel panel--accent-soft">
            <span class="material-symbols-outlined">eco</span>
            <h3>Eco-Warrior Status</h3>
            <p>Unlock exclusive monthly rewards and priority transit access.</p>
            <strong>5,000 total lifetime credits</strong>
        </article>
    </section>

    <section class="panel">
        <div class="section-head">
            <div>
                <span class="eyebrow">Marketplace</span>
                <h2>Transit and lifestyle rewards</h2>
            </div>
        </div>
        <div class="rewards-grid">
            ${a.rewards.map(e=>`
                <article class="reward-card">
                    <div class="reward-media"></div>
                    <h4>${e.name}</h4>
                    <p>${e.description}</p>
                    <div class="reward-footer">
                        <span>${e.cost} credits</span>
                        <button class="icon-action" data-action="redeem" data-reward="${e.id}" ${a.balance<e.cost?"disabled":""}>
                            <span class="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </article>
            `).join("")}
        </div>
    </section>
`,V=a=>`
    <section class="hero-card hero-card--booking">
        <div class="hero-copy">
            <div class="booking-head">
                <button class="back-chip" data-nav="explore">
                    <span class="material-symbols-outlined">arrow_back</span>
                    <span>Back</span>
                </button>
                <div class="pill">
                    <span class="material-symbols-outlined filled">train</span>
                    <span>${a.booking.status}</span>
                </div>
            </div>
            <h1>${a.booking.departureTime} RTS to ${a.booking.destination}</h1>
            <p>Your booked train, destination, and payment are all kept in one view so the main explore page can stay focused on trip readiness.</p>
        </div>
    </section>

    <section class="grid-two">
        <article class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Train ticket</span>
                    <h2>Departure details</h2>
                </div>
                <span class="material-symbols-outlined accent">departure_board</span>
            </div>
            <div class="selector-grid">
                <label class="field-card">
                    <small>From</small>
                    <select data-field="origin">${r(a.locationOptions,a.booking.origin)}</select>
                </label>
                <label class="field-card">
                    <small>To</small>
                    <select data-field="destination">${r(a.locationOptions,a.booking.destination)}</select>
                </label>
                <label class="field-card">
                    <small>Departure time</small>
                    <select data-field="train-time">${r(a.trainTimeOptions,a.booking.departureTime)}</select>
                </label>
            </div>
            <div class="ticket-grid">
                <div class="ticket-stat">
                    <small>Origin</small>
                    <strong>${a.booking.origin}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Destination</small>
                    <strong>${a.booking.destination}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Departure time</small>
                    <strong>${a.booking.departureTime}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Arrival time</small>
                    <strong>${a.booking.arrivalTime}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Platform</small>
                    <strong>${a.booking.platform}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Border ETA</small>
                    <strong>${a.booking.estimatedBorderArrival}</strong>
                </div>
            </div>
        </article>

        <article class="panel panel--ticket">
            <span class="eyebrow">Payment</span>
            <h2>${a.booking.fare}</h2>
            <p>Choose how the train fare will be charged once the booking is confirmed.</p>
            <div class="payment-list">
                <label class="field-card field-card--payment">
                    <small>Payment method</small>
                    <select data-field="train-payment">${r(a.trainPaymentOptions,a.booking.paymentMethod)}</select>
                </label>
                <div class="payment-row">
                    <small>Method</small>
                    <strong>${a.booking.paymentMethod}</strong>
                </div>
                <div class="payment-row">
                    <small>Ticket type</small>
                    <strong>Standard RTS seat</strong>
                </div>
                <div class="payment-row">
                    <small>Status</small>
                    <strong>Ready to charge after booking</strong>
                </div>
            </div>
            <button class="primary-action primary-action--light" data-action="open-pass">
                <span>Open Priority QR Pass</span>
                <span class="material-symbols-outlined">qr_code_2</span>
            </button>
        </article>
    </section>

    <section class="panel panel--notice">
        <div>
            <span class="eyebrow">Comparison</span>
            <h3>RTS booked, bus kept as fallback</h3>
            <p>${a.busBooking.route} still leaves at ${a.busBooking.departureTime} for ${a.busBooking.fare}, but your current RTS booking remains the fastest option.</p>
        </div>
        <div class="notice-actions">
            <button class="secondary-action" data-nav="explore">Return to explore</button>
            <button class="secondary-action" data-nav="alerts">Check alerts</button>
        </div>
    </section>
`,J=a=>a.activeTab==="alerts"?L(a):a.activeTab==="booking"?V(a):a.activeTab==="bus-booking"?W(a):a.activeTab==="carpool-booking"?D(a):a.activeTab==="credits"?G(a):a.activeTab==="rewards"?F(a):a.activeTab==="profile"?I(a):E(a),N=a=>{const e=h(),i=()=>{a.innerHTML=x(e,J(e))},t=s=>{const{action:o,reward:l,target:v,driver:u}=s.dataset;if(o==="accept-checkin"){f(e);return}if(o==="accept-alert"){w(e);return}if(o==="open-pass"){$(e);return}if(o==="switch-tab"&&v){g(e,v);return}if(o==="redeem"&&l){T(e,l);return}o==="select-driver"&&u&&S(e,u)},n=(s,o)=>{if(s==="destination"){B(e,o);return}if(s==="origin"){C(e,o);return}if(s==="bus-origin"){R(e,o);return}if(s==="train-time"){P(e,o);return}if(s==="bus-time"){_(e,o);return}if(s==="train-payment"){O(e,o);return}if(s==="bus-payment"){M(e,o);return}s==="carpool-payment"&&A(e,o)};a.addEventListener("click",s=>{const o=s.target.closest("[data-nav]");if(o){g(e,o.dataset.nav),i();return}const l=s.target.closest("[data-action]");l&&(t(l),i())}),a.addEventListener("change",s=>{const o=s.target.dataset.field;o&&(n(o,s.target.value),i())}),window.setInterval(()=>{e.countdownSeconds>0&&(e.countdownSeconds-=1);const s=document.querySelector("#countdown-value");s&&(s.textContent=b(e.countdownSeconds))},1e3),m(e),i()};N(document.querySelector("#app"));
