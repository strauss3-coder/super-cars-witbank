/* ==========================================================================
   SUPER CARS WITBANK  ·  Built-in content
   --------------------------------------------------------------------------
   The same content as database/02-seed.sql, kept here so the website works
   the moment you open it, before any database exists.

   When is this used?
     Only when there is nothing better. If js/config.js points at a real
     Supabase project, the database wins every time and nothing in this file
     is read. This is the fallback for a fresh copy of the site, and the
     safety net if the database is unreachable and the visitor has no cached
     copy — better a slightly stale page than a blank one.

   Do NOT treat this as a second place to edit content. Once Supabase is
   connected, the portal is the only place that matters and edits here will
   never appear. It is here so the site is never blank.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC = window.SC || {};
var IMG = 'assets/stock';

/* Builds the photo list for a stock number: 01.jpg .. NN.jpg */
function pics(stock,n){
  var out = [];
  for(var i=1;i<=n;i++) out.push(IMG+'/'+stock+'/'+(i<10?'0':'')+i+'.jpg');
  return out;
}

SC.fallback = {

  /* ------------------------------------------------------- settings -- */
  settings:{

    business:{
      name:'Super Cars Witbank',
      legalName:'Super Cars CC',
      shortName:'Super Cars',
      tagline:'For quality pre-owned vehicles',
      established:1999,
      address1:'75 Watermeyer Street',
      address2:'eMalahleni (Witbank)',
      province:'Mpumalanga',
      postcode:'1039',
      addressFull:'75 Watermeyer Street, eMalahleni (Witbank), Mpumalanga, 1039',
      landmark:'Next door to Goldwagen Witbank',
      phone:'013 692 7628',
      phoneAlt:'087 184 1167',
      mobile:'072 116 6136',
      mobileAlt:'072 095 7172',
      whatsapp:'072 116 6136',
      email:'moedindar@yahoo.com',
      website:'https://www.supercars-witbank.co.za',
      mapsUrl:'https://maps.google.com/?q=75+Watermeyer+Street+eMalahleni+1039',
      mapEmbed:'https://www.google.com/maps?q=75%20Watermeyer%20Street%2C%20eMalahleni%2C%201039&output=embed',
      googleRating:4.8,
      googleReviews:37,
      googleUrl:'https://www.google.com/search?q=super+cars+witbank',
      autotraderId:'3193',
      autotraderRating:4.4,
      autotraderReviews:14,
      logo:'',
      hours:[
        {day:'Monday',   open:'08:00',close:'17:00',closed:false},
        {day:'Tuesday',  open:'08:00',close:'17:00',closed:false},
        {day:'Wednesday',open:'08:00',close:'17:00',closed:false},
        {day:'Thursday', open:'08:00',close:'17:00',closed:false},
        {day:'Friday',   open:'08:00',close:'17:00',closed:false},
        {day:'Saturday', open:'08:00',close:'13:00',closed:false},
        {day:'Sunday',   open:'',     close:'',     closed:true}
      ],
      social:{
        facebook:'', instagram:'', tiktok:'',
        autotrader:'',
        carsza:''
      }
    },

    homepage:{
      heroBadge:'Witbank’s trusted pre-owned dealership',
      heroTitle:'Quality pre-owned vehicles.',
      heroTitleAccent:'Priced to move.',
      heroSubtitle:'Over 25 years of straight dealing in eMalahleni. Browse our current stock, get finance approved, or trade in the car you have.',
      ctaPrimary:{text:'Browse our stock',link:'inventory.html'},
      ctaSecondary:{text:'Get finance',link:'finance.html'},
      searchEnabled:true,
      searchPlaceholder:'Search by make, model or keyword',
      stats:[
        {label:'Years in business',value:'25+',      sub:'Serving eMalahleni'},
        {label:'Google rating',    value:'4.8',      sub:'From 37 reviews'},
        {label:'Vehicles in stock',value:'auto',     sub:'Updated daily'},
        {label:'Finance approved', value:'Same day', sub:'Through ABSA'}
      ],
      featuredTitle:'Featured stock',
      featuredSub:'Hand-picked vehicles from our current floor.',
      featuredCount:4,
      latestTitle:'Latest arrivals',
      latestSub:'The newest vehicles to land on our floor.',
      latestCount:6,
      categoriesTitle:'Shop by body type',
      categoriesSub:'Find the shape that suits how you drive.',
      categories:[
        {label:'Hatchback', body:'Hatchback'},
        {label:'Sedan',     body:'Sedan'},
        {label:'SUV',       body:'SUV'},
        {label:'Double Cab',body:'Double Cab'},
        {label:'Single Cab',body:'Single Cab'},
        {label:'MPV',       body:'MPV'}
      ],
      whyTitle:'Why buy from Super Cars',
      whySub:'The same way we have done business since 1999.',
      why:[
        {icon:'shield',title:'Every car checked',   text:'Nothing reaches our floor before it has been inspected and prepared properly.'},
        {icon:'bank',  title:'Finance sorted here', text:'We deal directly with ABSA Vehicle Finance and the other major banks on your behalf.'},
        {icon:'swap',  title:'Fair trade-in prices',text:'Bring the car you have. We will value it honestly and put the offer in writing.'},
        {icon:'star',  title:'4.8 out of 5',        text:'Rated by 37 customers on Google, and most of them came to us on a recommendation.'}
      ],
      testimonialsTitle:'What our customers say',
      testimonialsSub:'Reviews from people who bought their car here.',
      testimonialsCount:3,
      aboutTitle:'A family business, not a chain',
      aboutText:'Super Cars has sold quality pre-owned vehicles from Watermeyer Street in eMalahleni for over 25 years. We are small enough that you deal with the person who prices the car, and established enough that the banks take our calls.',
      aboutCta:{text:'More about us',link:'about.html'},
      tradeinTitle:'Thinking of selling?',
      tradeinText:'Send us a few photos and the mileage. We will come back to you with a real number, whether you are trading in or selling outright.',
      tradeinCta:{text:'Value my car',link:'sell.html'},
      financeTitle:'Finance made simple',
      financeText:'Work out what you can afford in a few seconds, then apply online. We handle the paperwork with the bank.',
      financeCta:{text:'Calculate and apply',link:'finance.html'},
      contactTitle:'Come and see the car',
      contactText:'We are on Watermeyer Street, open six days a week. No appointment needed.',
      sections:{
        hero:true, search:true, stats:true, featured:true, finance:true,
        latest:true, categories:true, why:true, testimonials:true,
        about:true, tradein:true, contact:true, map:true
      }
    },

    about:{
      title:'About Super Cars',
      subtitle:'Selling honest pre-owned cars in eMalahleni since 1999.',
      storyTitle:'Twenty-five years on Watermeyer Street',
      story:'Super Cars opened its doors in eMalahleni in 1999 and has traded from the same premises on Watermeyer Street ever since. What started as a small floor of a dozen cars has grown into one of the town’s established independent dealerships, but the way we work has not changed: we buy carefully, we price honestly, and we tell you what we know about a car before you ask.\n\nMost of our business still comes from people who were sent to us by someone we sold to years ago. That is the only advertising that has ever really worked for us, and it is why we would rather lose a deal than oversell a car.',
      ownerName:'H C Kuhn', ownerRole:'Owner', ownerPhoto:'', ownerQuote:'',
      valuesTitle:'What we stand on',
      values:[
        {title:'Honest descriptions',text:'If a car has a mark on it, we will point it out before you find it.'},
        {title:'Fair pricing',       text:'We price against the market, not against what we hope someone will pay.'},
        {title:'Proper preparation', text:'Every vehicle is serviced, checked and cleaned before it is advertised.'},
        {title:'After the sale',     text:'You can still phone us a year later. People do, and we answer.'}
      ],
      timelineTitle:'How we got here',
      timeline:[
        {year:'1999',title:'Super Cars opens',  text:'Trading begins on Watermeyer Street with a small floor of pre-owned vehicles.'},
        {year:'2010',title:'Finance desk added',text:'We start placing deals directly with the major banks so customers do not have to.'},
        {year:'2018',title:'Online listings',   text:'Our stock goes onto AutoTrader, reaching buyers across Mpumalanga and Gauteng.'},
        {year:'2024',title:'4.8 on Google',     text:'Thirty-seven customers rate us 4.8 out of 5.'}
      ],
      teamTitle:'The people you will deal with',
      teamSub:'A small team, which is why you get the same person every time.',
      team:[
        {name:'H C Kuhn',  role:'Owner',
         bio:'Has run Super Cars from Watermeyer Street since 1999 and still prices every car that comes onto the floor.', photo:''},
        {name:'Mohammed',  role:'Sales Manager',
         bio:'Looks after the floor day to day and places the finance applications himself. Most of our reviews mention him by name.', photo:''}
      ],
      locationTitle:'Find us',
      locationText:'We are on Watermeyer Street in eMalahleni, a few minutes from the N4. There is parking on site and you are welcome to walk the floor without anyone following you around.'
    },

    finance:{
      title:'Vehicle finance',
      subtitle:'Work out the monthly payment, then apply. We deal with the bank for you.',
      intro:'We place finance through ABSA Vehicle Finance and the other major South African banks. Because we submit the application ourselves, we know what each bank is looking for, and we can usually tell you the same day whether a deal will fly.',
      partner:'ABSA Vehicle Finance',
      calcTitle:'Work out your instalment',
      calcNote:'This is an estimate to help you budget. Your final rate depends on your credit profile and is set by the bank, not by us.',
      defaultRate:11.75,
      defaultTermMonths:72,
      termOptions:[24,36,48,54,60,72],
      defaultDepositPct:10,
      defaultResidualPct:0,
      maxResidualPct:35,
      initiationFee:1207.50,
      monthlyServiceFee:69.00,
      stepsTitle:'How it works',
      steps:[
        {title:'Work out the number',text:'Use the calculator to find a monthly payment that fits your budget.'},
        {title:'Send the application',text:'Fill in the form below. It takes about three minutes.'},
        {title:'We submit it',text:'We place it with the bank most likely to approve your profile.'},
        {title:'Collect the car',text:'Once approved, we handle the licensing and hand over the keys.'}
      ],
      requirementsTitle:'What the bank will need',
      requirements:[
        'South African ID document',
        'Valid driver’s licence',
        'Latest three months’ bank statements',
        'Latest payslip or proof of income',
        'Proof of residence, not older than three months'
      ],
      formTitle:'Apply for finance',
      formNote:'We use these details to place your application with the bank. We do not share them with anyone else.'
    },

    sell:{
      title:'Sell or trade in your car',
      subtitle:'Tell us what you have. We will come back with a real offer.',
      intro:'Whether you are trading in against something on our floor or simply want to sell, send us the details and a few photos. We will look at what the car is actually worth in this market and come back to you, usually the same day.',
      stepsTitle:'Three steps',
      steps:[
        {title:'Send us the details',text:'Make, model, year, mileage and a few photos.'},
        {title:'We value it',        text:'We check the market and the condition, then put a number to it.'},
        {title:'You decide',         text:'Take the offer as cash, or put it towards a car on our floor.'}
      ],
      pointsTitle:'Why sell to us',
      points:[
        'No obligation and no charge for the valuation',
        'We settle outstanding finance directly with your bank',
        'Payment on collection, once the paperwork is done',
        'We buy even if you are not buying from us'
      ],
      formTitle:'Tell us about your car',
      formNote:'Photos help us give you an accurate number. Six is plenty: front, back, both sides, the interior and the odometer.',
      maxPhotos:8
    },

    navigation:{
      items:[
        {label:'Home',       link:'index.html'},
        {label:'Stock',      link:'inventory.html'},
        {label:'Finance',    link:'finance.html'},
        {label:'Sell my car',link:'sell.html'},
        {label:'About',      link:'about.html'},
        {label:'Reviews',    link:'testimonials.html'},
        {label:'Contact',    link:'contact.html'}
      ]
    },

    footer:{
      blurb:'Quality pre-owned vehicles in eMalahleni since 1999. Trading from 75 Watermeyer Street, six days a week.',
      columns:[
        {title:'Browse',links:[
          {label:'All stock',  link:'inventory.html'},
          {label:'SUVs',       link:'inventory.html?body=SUV'},
          {label:'Bakkies',    link:'inventory.html?body=Double%20Cab'},
          {label:'Hatchbacks', link:'inventory.html?body=Hatchback'}
        ]},
        {title:'Services',links:[
          {label:'Vehicle finance',  link:'finance.html'},
          {label:'Sell or trade in', link:'sell.html'},
          {label:'Customer reviews', link:'testimonials.html'}
        ]},
        {title:'Company',links:[
          {label:'About us',      link:'about.html'},
          {label:'Contact',       link:'contact.html'},
          {label:'Privacy policy',link:'privacy.html'},
          {label:'Terms of use',  link:'terms.html'}
        ]}
      ],
      legalNote:'Super Cars Witbank is a licensed motor vehicle dealer. All vehicles are sold as pre-owned. Prices exclude licensing and registration unless stated otherwise. E&OE.',
      copyright:'Super Cars Witbank'
    },

    legal:{
      privacyTitle:'Privacy policy',
      privacyUpdated:'2026-08-31',
      privacyBody:'## Who we are\n\nSuper Cars Witbank, of 75 Watermeyer Street, eMalahleni, 1039, is the responsible party for the personal information collected through this website, as contemplated in the Protection of Personal Information Act 4 of 2013 (POPIA).\n\n## What we collect\n\nWe collect only what you give us through the forms on this site: your name, telephone number, email address, and the details of the vehicle you are enquiring about, selling or financing. A finance application additionally asks for your identity number, employment details and income, because the bank requires them to assess the application.\n\nWe also record which vehicle pages are viewed, so that we know which stock is generating interest. That record is not linked to your name.\n\n## Why we collect it\n\nTo answer your enquiry, to value a vehicle you want to sell, and to place a finance application with a bank on your instruction. We do not use your details for anything else.\n\n## Who we share it with\n\nA finance application is shared with the bank or banks we submit it to, because that is the purpose of sending it. Nothing else is shared with anyone, and we do not sell or rent personal information to third parties.\n\n## How long we keep it\n\nEnquiries are kept for as long as we may reasonably need them to deal with you, and are then deleted. Records relating to a completed sale are kept for the period required by South African tax and consumer protection law.\n\n## Your rights\n\nYou may ask us what we hold about you, ask us to correct it, or ask us to delete it. Write to us at the address above or telephone the dealership and we will deal with the request.\n\n## Cookies\n\nThis website stores a small amount of information in your browser so that pages load faster on a return visit. It does not track you across other websites and there is no advertising network on this site.',
      termsTitle:'Terms of use',
      termsUpdated:'2026-08-31',
      termsBody:'## About these terms\n\nThese terms govern your use of the Super Cars Witbank website. By using the site you accept them.\n\n## Vehicle listings\n\nEvery effort is made to keep stock, prices and specifications accurate and current. Listings are nevertheless subject to change and to prior sale, and errors and omissions are excepted (E&OE). A listing on this website is an invitation to do business and is not an offer capable of acceptance.\n\nVehicle specifications shown, including mileage, fuel consumption, power and emissions figures, are drawn from the manufacturer’s data and from our own records. Figures for fuel consumption and emissions are manufacturer test figures and will differ in real driving conditions. Please confirm anything that matters to your decision with us directly before you buy.\n\n## Prices\n\nPrices are in South African Rand and, unless expressly stated otherwise, exclude licensing, registration and delivery. A price shown on this website does not include any optional extras fitted after the listing was prepared.\n\n## Finance\n\nFinance is subject to approval by the relevant financial institution and to the National Credit Act 34 of 2005. Any monthly figure shown on this website, including any figure produced by the calculator, is an estimate for budgeting purposes only. It is not a quotation, not an offer of credit, and not binding on us or on any bank. Super Cars Witbank is not a credit provider.\n\n## Trade-in valuations\n\nA valuation given through this website is an indication based on the information and photographs you supply. It is not binding and is subject to physical inspection of the vehicle.\n\n## Your consumer rights\n\nNothing in these terms limits any right you have under the Consumer Protection Act 68 of 2008 or any other law that cannot lawfully be excluded.\n\n## This website\n\nWe do our best to keep the site available and correct but we do not warrant that it will be uninterrupted or error free. Links to other websites are provided for convenience and we are not responsible for their content.\n\n## Governing law\n\nThese terms are governed by the law of the Republic of South Africa.'
    },

    seo:{
      siteName:'Super Cars Witbank',
      titleSuffix:' | Super Cars Witbank',
      defaultImage:'',
      robots:'index,follow',
      pages:{
        index:{title:'Quality Pre-Owned Cars in Witbank',description:'Super Cars Witbank has sold quality pre-owned vehicles from Watermeyer Street in eMalahleni since 1999. Browse current stock, apply for finance or trade in your car.',keywords:'used cars witbank, pre-owned cars emalahleni, car dealership witbank, cars for sale mpumalanga'},
        inventory:{title:'Used Cars for Sale in Witbank',description:'Browse every vehicle on our floor in eMalahleni. Filter by make, model, price, body type, transmission and fuel. Updated as stock changes.',keywords:'used cars for sale witbank, second hand cars emalahleni, bakkies for sale mpumalanga'},
        vehicle:{title:'Vehicle Details',description:'Full specifications, photographs and finance estimate for this vehicle at Super Cars Witbank.',keywords:''},
        finance:{title:'Vehicle Finance in Witbank',description:'Work out your monthly instalment and apply for vehicle finance through ABSA and the major South African banks. Super Cars Witbank handles the application for you.',keywords:'car finance witbank, vehicle finance emalahleni, absa vehicle finance'},
        sell:{title:'Sell or Trade In Your Car in Witbank',description:'Send us your car’s details and photographs for a free, no obligation valuation. We buy outright or trade in against our stock.',keywords:'sell my car witbank, trade in car emalahleni, car valuation mpumalanga'},
        about:{title:'About Us',description:'Super Cars has traded pre-owned vehicles from Watermeyer Street in eMalahleni since 1999. Rated 4.8 out of 5 by our customers on Google.',keywords:'super cars witbank, car dealership emalahleni'},
        testimonials:{title:'Customer Reviews',description:'Read what customers say about buying a car from Super Cars Witbank. Rated 4.8 out of 5 from 37 Google reviews.',keywords:'super cars witbank reviews, car dealer reviews emalahleni'},
        contact:{title:'Contact Us',description:'Visit us at 75 Watermeyer Street, eMalahleni, or call 013 692 7628. Open Monday to Saturday.',keywords:'contact super cars witbank, car dealer watermeyer street'},
        privacy:{title:'Privacy Policy',description:'How Super Cars Witbank collects, uses and protects your personal information under POPIA.',keywords:''},
        terms:{title:'Terms of Use',description:'The terms that govern your use of the Super Cars Witbank website.',keywords:''},
        notfound:{title:'Page Not Found',description:'The page you were looking for is not here.',keywords:''}
      }
    }
  },

  /* ------------------------------------------------------- vehicles -- */
  /* Rows in the shape website_vehicles returns, so the same mapping runs
     whether the data came from here or from Supabase.

     Stock 0006 and 0010 are absent on purpose. They are archived drafts in
     the database because their year, mileage and price are not known, and
     the public view excludes archived stock. */
  vehicles:[
/* >>> GENERATED BY database/stock.py, DO NOT EDIT BY HAND >>> */
    { id:'v_0001', stock:'0001', make:'BMW', model:'1 Series', variant:'118i 5-Door Auto',
      year:2015, mileage:101000, transmission:'Automatic', fuel:'Petrol', body:'Hatchback',
      colour:'Silver', engine:'', power_kw:100, seats:5, fuel_use:5.6,
      co2:133, zero_to_hundred:8.7, doors:5, price:199950,
      price_badge:'', installment:0, finance_eligible:true,
      description:'A 2015 BMW 118i in silver with the 5-door body and the automatic gearbox, showing 101 000 km. The 1.5 litre turbo petrol returns a genuine 5.6 l/100km on the combined cycle while still pulling to 100 km/h in 8.7 seconds, which is a rare combination in a hatch this size. Rear wheel drive, as a 1 Series should be. A tidy, well kept example that drives exactly as it should.',
      features:['Automatic transmission','Rear wheel drive','Multifunction steering wheel','Air conditioning','Electric windows','Alloy wheels','Central locking','Front fog lamps','Cruise control','Bluetooth'],
      images:pics('0001',5), video:'', service_history:'Full service history', condition:'Very Good',
      status:'available', featured:false, promoted:false, reserved:false,
      sold:false, slug:'2015-bmw-1-series-118i-5-door-auto-0001', meta_title:'', meta_description:'', views:0,
      sort_order:1, created_at:'2026-08-23T09:00:00Z' },

    { id:'v_0002', stock:'0002', make:'Nissan', model:'NP200', variant:'1.6i (Aircon) Safety Pack',
      year:2021, mileage:146000, transmission:'Manual', fuel:'Petrol', body:'Single Cab',
      colour:'Silver', engine:'', power_kw:64, seats:2, fuel_use:8.1,
      co2:192, zero_to_hundred:null, doors:2, price:209950,
      price_badge:'', installment:0, finance_eligible:true,
      description:'A 2021 Nissan NP200 1.6i with aircon, the Safety Pack and a canopy already fitted, showing 146 000 km. The half tonne workhorse that South Africa keeps buying for good reason: simple, cheap to run and easy to fix anywhere. This one has clearly worked but has been looked after, and the canopy means it is ready to earn its keep from the day you take it.',
      features:['Air conditioning','Safety Pack','Canopy fitted','Power steering','Central locking','Electric windows','Radio','Tow bar','Rubberised load bin'],
      images:pics('0002',5), video:'', service_history:'Partial service history', condition:'Good',
      status:'available', featured:false, promoted:false, reserved:false,
      sold:false, slug:'2021-nissan-np200-1-6i-aircon-safety-pack-0002', meta_title:'', meta_description:'', views:0,
      sort_order:2, created_at:'2026-08-22T09:00:00Z' },

    { id:'v_0003', stock:'0003', make:'Volkswagen', model:'T-Cross', variant:'1.0TSI 70kW Comfortline',
      year:2021, mileage:112000, transmission:'Manual', fuel:'Petrol', body:'SUV',
      colour:'White', engine:'', power_kw:70, seats:5, fuel_use:4.8,
      co2:110, zero_to_hundred:10.8, doors:5, price:259950,
      price_badge:'Fair Price', installment:0, finance_eligible:true,
      description:'A 2021 Volkswagen T-Cross 1.0TSI Comfortline in white, manual, showing 112 000 km. Volkswagen\'s small crossover does the sensible things very well: 4.8 l/100km on the combined cycle, a high seating position, and a boot that slides to trade rear legroom for luggage when you need it. Well specified and honestly priced for the mileage.',
      features:['Comfortline specification','Touchscreen infotainment','Bluetooth and USB','Air conditioning','Electric windows','Alloy wheels','Rear parking sensors','Cruise control','Sliding rear bench','ISOFIX child seat anchors'],
      images:pics('0003',5), video:'', service_history:'Full service history', condition:'Very Good',
      status:'available', featured:false, promoted:false, reserved:false,
      sold:false, slug:'2021-volkswagen-t-cross-1-0tsi-70kw-comfortline-0003', meta_title:'', meta_description:'', views:0,
      sort_order:3, created_at:'2026-08-21T09:00:00Z' },

    { id:'v_0004', stock:'0004', make:'Audi', model:'A1', variant:'Sportback 1.4TFSI S tronic',
      year:2014, mileage:134000, transmission:'Automatic', fuel:'Petrol', body:'Hatchback',
      colour:'White', engine:'', power_kw:90, seats:5, fuel_use:5.3,
      co2:122, zero_to_hundred:9.0, doors:5, price:179950,
      price_badge:'High Price', installment:0, finance_eligible:true,
      description:'A 2014 Audi A1 Sportback 1.4TFSI in white with the S tronic gearbox, showing 134 000 km. The five-door Sportback body makes it far more usable than the three-door without losing the shape. 90 kW from the 1.4 turbo, 5.3 l/100km, and the interior quality that made the A1 worth the money in the first place.',
      features:['S tronic automatic','Alloy wheels','Air conditioning','Multifunction steering wheel','Electric windows','Bluetooth','Front fog lamps','Split folding rear seats','ISOFIX child seat anchors'],
      images:pics('0004',4), video:'', service_history:'Partial service history', condition:'Good',
      status:'available', featured:false, promoted:false, reserved:false,
      sold:false, slug:'2014-audi-a1-sportback-1-4tfsi-s-tronic-0004', meta_title:'', meta_description:'', views:0,
      sort_order:4, created_at:'2026-08-20T09:00:00Z' },

    { id:'v_0005', stock:'0005', make:'BMW', model:'3 Series', variant:'320i Auto',
      year:2012, mileage:94000, transmission:'Automatic', fuel:'Petrol', body:'Sedan',
      colour:'White', engine:'', power_kw:135, seats:5, fuel_use:5.9,
      co2:138, zero_to_hundred:7.6, doors:4, price:159950,
      price_badge:'Fair Price', installment:0, finance_eligible:true,
      description:'A 2012 BMW 320i automatic in white with only 94 000 km, which is low for the year. The F30 generation 320i gives you 135 kW, a 7.6 second run to 100 km/h and still only 5.9 l/100km on the combined cycle. Rear wheel drive, eight speed automatic, and the ride and steering that made this the class benchmark. Genuinely low mileage examples like this are getting hard to find.',
      features:['Eight speed automatic','Rear wheel drive','Leather seats','Dual zone climate control','Cruise control','Alloy wheels','Park distance control','Bluetooth','Multifunction steering wheel','Start stop'],
      images:pics('0005',5), video:'', service_history:'Full service history', condition:'Very Good',
      status:'available', featured:true, promoted:false, reserved:false,
      sold:false, slug:'2012-bmw-3-series-320i-auto-0005', meta_title:'', meta_description:'', views:0,
      sort_order:5, created_at:'2026-08-19T09:00:00Z' },

    { id:'v_0006', stock:'0006', make:'Toyota', model:'Rumion', variant:'1.5 S',
      year:2026, mileage:150, transmission:'Manual', fuel:'Petrol', body:'MPV',
      colour:'Silver', engine:'', power_kw:null, seats:7, fuel_use:null,
      co2:null, zero_to_hundred:null, doors:5, price:359950,
      price_badge:'Great Price', installment:0, finance_eligible:true,
      description:'A 2026 Toyota Rumion 1.5 S in silver with 150 km on the clock. This is a demonstration unit, so it is effectively a new car at a used car price, with the balance of its factory plan still to run. Seven seats in a body small enough to park easily, and the Toyota badge on the front, which in this part of the country matters when it comes time to sell it again.',
      features:['Seven seats','Near new demonstration unit','Air conditioning','Touchscreen infotainment','Bluetooth','Electric windows','Central locking','ISOFIX child seat anchors','ABS with EBD','Driver and passenger airbags'],
      images:pics('0006',5), video:'', service_history:'Full service history', condition:'Excellent',
      status:'available', featured:true, promoted:false, reserved:false,
      sold:false, slug:'2026-toyota-rumion-1-5-s-0006', meta_title:'', meta_description:'', views:0,
      sort_order:6, created_at:'2026-08-18T09:00:00Z' },

    { id:'v_0007', stock:'0007', make:'Audi', model:'Q5', variant:'2.0TDI S quattro',
      year:2020, mileage:83000, transmission:'Automatic', fuel:'Diesel', body:'SUV',
      colour:'Grey', engine:'', power_kw:null, seats:5, fuel_use:null,
      co2:null, zero_to_hundred:null, doors:5, price:579950,
      price_badge:'High Price', installment:0, finance_eligible:true,
      description:'This 2020 Audi Q5 2.0 TDI S quattro in grey offers a strong mix of efficiency, performance and all weather capability. The 2.0 litre turbo diesel delivers solid torque with excellent fuel economy, paired to Audi\'s quattro all wheel drive for secure handling and confident road holding. Showing 83 000 km and presenting extremely well on the S line body kit and large alloys.',
      features:['quattro all wheel drive','S line exterior','LED headlights','Leather upholstery','Virtual cockpit','Dual zone climate control','Electric tailgate','Park distance control front and rear','Reverse camera','Cruise control','Panoramic roof','Alloy wheels'],
      images:pics('0007',5), video:'', service_history:'Full service history', condition:'Excellent',
      status:'available', featured:true, promoted:false, reserved:false,
      sold:false, slug:'2020-audi-q5-2-0tdi-s-quattro-0007', meta_title:'', meta_description:'', views:0,
      sort_order:7, created_at:'2026-08-17T09:00:00Z' },

    { id:'v_0008', stock:'0008', make:'Mercedes-Benz', model:'C-Class', variant:'C180 Auto',
      year:2020, mileage:103000, transmission:'Automatic', fuel:'Petrol', body:'Sedan',
      colour:'White', engine:'', power_kw:115, seats:5, fuel_use:6.5,
      co2:147, zero_to_hundred:8.6, doors:4, price:349950,
      price_badge:'Fair Price', installment:0, finance_eligible:true,
      description:'A 2020 Mercedes-Benz C180 in white, automatic, showing 103 000 km. 115 kW, 6.5 l/100km and 8.6 seconds to 100 km/h from the turbocharged petrol, with the nine speed automatic that makes the car so easy in traffic. The facelifted interior with the widescreen cluster and the sunroof fitted. A properly specified example of the last of this generation.',
      features:['Nine speed automatic','Sunroof','Leather upholstery','Dual zone climate control','Reverse camera','Park distance control','Cruise control','LED headlights','Alloy wheels','Bluetooth and Apple CarPlay','Keyless start'],
      images:pics('0008',5), video:'', service_history:'Full service history', condition:'Excellent',
      status:'available', featured:true, promoted:true, reserved:false,
      sold:false, slug:'2020-mercedes-benz-c-class-c180-auto-0008', meta_title:'', meta_description:'', views:0,
      sort_order:8, created_at:'2026-08-16T09:00:00Z' },

    { id:'v_0009', stock:'0009', make:'Toyota', model:'Fortuner', variant:'2.4GD-6 Auto',
      year:2021, mileage:99000, transmission:'Automatic', fuel:'Diesel', body:'SUV',
      colour:'White', engine:'', power_kw:110, seats:7, fuel_use:7.2,
      co2:190, zero_to_hundred:null, doors:5, price:479950,
      price_badge:'Fair Price', installment:0, finance_eligible:true,
      description:'A 2021 Toyota Fortuner 2.4GD-6 automatic in white, showing 99 000 km, with a nudge bar and side steps already fitted. Seven seats, 110 kW and 7.2 l/100km from the 2.4 turbo diesel. The Fortuner needs no introduction in this part of the country: it holds its value, it goes where you point it, and every town has someone who can service it.',
      features:['Seven seats','Nudge bar','Side steps','Reverse camera','Touchscreen infotainment','Dual zone climate control','Cruise control','Alloy wheels','Park distance control','Bluetooth','Roof rails','Tow bar'],
      images:pics('0009',5), video:'', service_history:'Full service history', condition:'Very Good',
      status:'available', featured:true, promoted:true, reserved:false,
      sold:false, slug:'2021-toyota-fortuner-2-4gd-6-auto-0009', meta_title:'', meta_description:'', views:0,
      sort_order:9, created_at:'2026-08-15T09:00:00Z' },

    { id:'v_0010', stock:'0010', make:'Volkswagen', model:'Polo Vivo', variant:'Hatch 1.6 Life Edition 15',
      year:2025, mileage:42000, transmission:'Automatic', fuel:'Petrol', body:'Hatchback',
      colour:'Silver', engine:'', power_kw:null, seats:5, fuel_use:null,
      co2:null, zero_to_hundred:null, doors:5, price:269950,
      price_badge:'High Price', installment:0, finance_eligible:true,
      description:'A 2025 Volkswagen Polo Vivo 1.6 Life Edition 15 in silver, automatic, showing only 42 000 km. The Edition 15 celebrates fifteen years of the Vivo and adds the alloys and trim over the standard car. An automatic Vivo is the easy answer for town driving, and at this mileage it has barely started its life.',
      features:['Automatic transmission','Edition 15 specification','Alloy wheels','Air conditioning','Touchscreen with Bluetooth','Electric front windows','Central locking','Split folding rear seat','ISOFIX child seat anchors','ABS with EBD'],
      images:pics('0010',5), video:'', service_history:'Full service history', condition:'Excellent',
      status:'available', featured:false, promoted:false, reserved:false,
      sold:false, slug:'2025-volkswagen-polo-vivo-hatch-1-6-life-edition-15-0010', meta_title:'', meta_description:'', views:0,
      sort_order:10, created_at:'2026-08-14T09:00:00Z' },

    { id:'v_0011', stock:'0011', make:'Volkswagen', model:'Polo Vivo', variant:'Hatch 1.4 Trendline',
      year:2023, mileage:68000, transmission:'Manual', fuel:'Petrol', body:'Hatchback',
      colour:'Grey', engine:'', power_kw:55, seats:5, fuel_use:5.7,
      co2:132, zero_to_hundred:null, doors:5, price:189950,
      price_badge:'Fair Price', installment:0, finance_eligible:true,
      description:'A 2023 Volkswagen Polo Vivo Hatch 1.4 Trendline in grey, showing 68 000 km. The Vivo is the default first car in South Africa because it earns it: 5.7 l/100km, parts on every shelf in the country, and a resale value that barely moves. This one is a 2023 model still well inside its life, and it presents cleanly inside and out.',
      features:['Air conditioning','Electric front windows','Central locking','Radio with Bluetooth','Alloy wheels','Split folding rear seat','ISOFIX child seat anchors','Driver and passenger airbags','ABS with EBD'],
      images:pics('0011',5), video:'', service_history:'Full service history', condition:'Very Good',
      status:'available', featured:false, promoted:true, reserved:false,
      sold:false, slug:'2023-volkswagen-polo-vivo-hatch-1-4-trendline-0011', meta_title:'', meta_description:'', views:0,
      sort_order:11, created_at:'2026-08-13T09:00:00Z' },

    { id:'v_0012', stock:'0012', make:'Volkswagen', model:'Amarok', variant:'2.0BiTDI Double Cab Highline 4Motion Auto',
      year:2020, mileage:116000, transmission:'Automatic', fuel:'Diesel', body:'Double Cab',
      colour:'White', engine:'', power_kw:132, seats:5, fuel_use:8.5,
      co2:224, zero_to_hundred:11.3, doors:4, price:429950,
      price_badge:'', installment:0, finance_eligible:true,
      description:'A 2020 Volkswagen Amarok 2.0 BiTDI Double Cab Highline 4Motion automatic in white, showing 116 000 km, with a canopy fitted. 132 kW and permanent four wheel drive through the eight speed automatic. The Amarok remains the double cab that drives most like a car, with the widest load bin in the class and enough torque to tow properly. Highline specification, so it has the equipment.',
      features:['4Motion permanent all wheel drive','Eight speed automatic','Canopy fitted','Leather upholstery','Reverse camera','Park distance control','Dual zone climate control','Cruise control','Alloy wheels','Bluetooth','Tow bar','Side steps'],
      images:pics('0012',5), video:'', service_history:'Full service history', condition:'Very Good',
      status:'available', featured:true, promoted:true, reserved:false,
      sold:false, slug:'2020-volkswagen-amarok-2-0bitdi-double-cab-highline-4motion-auto-0012', meta_title:'', meta_description:'', views:0,
      sort_order:12, created_at:'2026-08-12T09:00:00Z' },

    { id:'v_0013', stock:'0013', make:'Volkswagen', model:'T-Cross', variant:'1.0TSI 85kW Highline R-Line',
      year:2023, mileage:57000, transmission:'Automatic', fuel:'Petrol', body:'SUV',
      colour:'', engine:'', power_kw:85, seats:5, fuel_use:5.3,
      co2:126, zero_to_hundred:10.2, doors:5, price:339950,
      price_badge:'Great Price', installment:0, finance_eligible:true,
      description:'A 2023 Volkswagen T-Cross 1.0TSI Highline with the R-Line package, automatic, showing 57 000 km. The 85 kW version is the one to have: the same frugal 1.0 TSI but with enough in reserve for the open road, and the R-Line trim adds the sportier bumpers and wheels. Low mileage for the year.',
      features:['Highline specification','R-Line package','Automatic transmission','Touchscreen infotainment','Digital instrument cluster','Alloy wheels','Park distance control','Cruise control','Air conditioning','Sliding rear bench'],
      images:[], video:'', service_history:'Full service history', condition:'Excellent',
      status:'available', featured:false, promoted:false, reserved:false,
      sold:false, slug:'2023-volkswagen-t-cross-1-0tsi-85kw-highline-r-line-0013', meta_title:'', meta_description:'', views:0,
      sort_order:13, created_at:'2026-08-11T09:00:00Z' },

    { id:'v_0014', stock:'0014', make:'Hyundai', model:'H-100', variant:'Bakkie 2.6D Forward Control',
      year:2020, mileage:126000, transmission:'Manual', fuel:'Diesel', body:'Single Cab',
      colour:'', engine:'', power_kw:null, seats:3, fuel_use:null,
      co2:null, zero_to_hundred:null, doors:2, price:219950,
      price_badge:'Fair Price', installment:0, finance_eligible:true,
      description:'A 2020 Hyundai H-100 2.6 diesel dropside, showing 126 000 km. The forward control cab puts the whole wheelbase behind you, which is why this body carries more than a conventional bakkie of the same length. A genuine one tonne workhorse for a business that needs to move material rather than impress anybody.',
      features:['One tonne payload','Dropside body','Diesel engine','Power steering','Air conditioning','Radio','Tow bar'],
      images:[], video:'', service_history:'Partial service history', condition:'Good',
      status:'available', featured:false, promoted:false, reserved:false,
      sold:false, slug:'2020-hyundai-h-100-bakkie-2-6d-forward-control-0014', meta_title:'', meta_description:'', views:0,
      sort_order:14, created_at:'2026-08-10T09:00:00Z' },

    { id:'v_0015', stock:'0015', make:'Suzuki', model:'Ertiga', variant:'1.5 GA',
      year:2026, mileage:150, transmission:'Manual', fuel:'Petrol', body:'MPV',
      colour:'', engine:'', power_kw:null, seats:7, fuel_use:null,
      co2:null, zero_to_hundred:null, doors:5, price:369950,
      price_badge:'Fair Price', installment:0, finance_eligible:true,
      description:'A 2026 Suzuki Ertiga 1.5 GA with 150 km on it, so effectively a new vehicle. Seven seats, a 1.5 petrol that will not frighten you at the pumps, and running costs low enough that this is the default choice for e-hailing operators and large families alike.',
      features:['Seven seats','Near new demonstration unit','Air conditioning','Electric front windows','Central locking','Radio with Bluetooth','Dual airbags','ABS with EBD','ISOFIX child seat anchors'],
      images:[], video:'', service_history:'Full service history', condition:'Excellent',
      status:'available', featured:false, promoted:false, reserved:false,
      sold:false, slug:'2026-suzuki-ertiga-1-5-ga-0015', meta_title:'', meta_description:'', views:0,
      sort_order:15, created_at:'2026-08-09T09:00:00Z' },

    { id:'v_0016', stock:'0016', make:'Toyota', model:'Corolla Cross', variant:'1.8 Xi',
      year:2025, mileage:15, transmission:'Automatic', fuel:'Petrol', body:'SUV',
      colour:'', engine:'', power_kw:null, seats:5, fuel_use:null,
      co2:null, zero_to_hundred:null, doors:5, price:399950,
      price_badge:'High Price', installment:0, finance_eligible:true,
      description:'A 2025 Toyota Corolla Cross 1.8 Xi with 15 km on the odometer, which makes it a new car in all but the paperwork. The Corolla Cross has become the sensible family crossover in South Africa for the same reasons the Corolla always was: it is easy to own, cheap to run and holds its money.',
      features:['Automatic transmission','Touchscreen infotainment','Reverse camera','Cruise control','Air conditioning','Alloy wheels','Electric windows','ISOFIX child seat anchors','Multiple airbags'],
      images:[], video:'', service_history:'Full service history', condition:'Excellent',
      status:'available', featured:false, promoted:false, reserved:false,
      sold:false, slug:'2025-toyota-corolla-cross-1-8-xi-0016', meta_title:'', meta_description:'', views:0,
      sort_order:16, created_at:'2026-08-08T09:00:00Z' },

    { id:'v_0017', stock:'0017', make:'Audi', model:'A3', variant:'Sedan 30TFSI Auto',
      year:2020, mileage:99000, transmission:'Automatic', fuel:'Petrol', body:'Sedan',
      colour:'', engine:'', power_kw:null, seats:5, fuel_use:null,
      co2:null, zero_to_hundred:null, doors:4, price:299950,
      price_badge:'Fair Price', installment:0, finance_eligible:true,
      description:'A 2020 Audi A3 Sedan 30TFSI automatic, showing 99 000 km. The sedan body gives you a proper boot without losing the A3\'s proportions, and the 30TFSI is the economical one to run day to day. Well built inside, as an A3 always is.',
      features:['Automatic transmission','Alloy wheels','Dual zone climate control','Cruise control','Park distance control','Bluetooth','Multifunction steering wheel','LED headlights'],
      images:[], video:'', service_history:'Full service history', condition:'Very Good',
      status:'available', featured:false, promoted:false, reserved:false,
      sold:false, slug:'2020-audi-a3-sedan-30tfsi-auto-0017', meta_title:'', meta_description:'', views:0,
      sort_order:17, created_at:'2026-08-07T09:00:00Z' }
/* <<< END GENERATED <<< */
  ],

  /* No invented customers. Super Cars has 37 genuine Google reviews and that
     rating is shown from the business record; the review text is left for
     staff to add through the portal. */
  testimonials:[]
};

})();
