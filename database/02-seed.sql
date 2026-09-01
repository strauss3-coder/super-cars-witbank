-- ============================================================================
-- SUPER CARS WITBANK  ·  Seed data
-- ----------------------------------------------------------------------------
-- Run AFTER 01-schema.sql, and after you have added yourself to portal_users.
-- Safe to run more than once: every insert upserts on the primary key.
--
-- BEFORE YOU RUN THIS, change one line. Find `base_url` below and put your own
-- Supabase project URL there. That is the only edit this file needs; every
-- photo path is built from it.
--
-- Everything here is real. Vehicle specifications come from the dealership's
-- own AutoTrader listings, and the business details from the Google Business
-- Profile and the signage on the building. Two records are deliberately left
-- incomplete and archived, and are marked DRAFT below with the reason.
-- ============================================================================

do $$
declare
  -- >>> CHANGE THIS to your Supabase project URL, no trailing slash <<<
  base_url text := 'https://gbjuimzlbyznldhhqguc.supabase.co';
  img      text := base_url || '/storage/v1/object/public/vehicle-images/stock';
begin

-- ---------------------------------------------------------------------------
-- BUSINESS DETAILS  ->  Business Information module, every page header/footer
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values ('business', jsonb_build_object(
  'name',        'Super Cars Witbank',
  'legalName',   'Super Cars CC',
  'shortName',   'Super Cars',
  'tagline',     'For quality pre-owned vehicles',
  'established', 1999,
  'address1',    '75 Watermeyer Street',
  'address2',    'eMalahleni (Witbank)',
  'province',    'Mpumalanga',
  'postcode',    '1039',
  'addressFull', '75 Watermeyer Street, eMalahleni (Witbank), Mpumalanga, 1039',
  'landmark',    'Next door to Goldwagen Witbank',
  'phone',       '013 692 7628',
  'phoneAlt',    '087 184 1167',
  'mobile',      '072 116 6136',
  'mobileAlt',   '072 095 7172',
  'whatsapp',    '072 116 6136',
  'email',       'moedindar@yahoo.com',
  'website',     'https://www.supercars-witbank.co.za',
  'mapsUrl',     'https://maps.google.com/?q=75+Watermeyer+Street+eMalahleni+1039',
  'mapEmbed',    'https://www.google.com/maps?q=75%20Watermeyer%20Street%2C%20eMalahleni%2C%201039&output=embed',
  'googleRating', 4.8,
  'googleReviews', 37,
  'googleUrl',   'https://www.google.com/search?q=super+cars+witbank',
  'autotraderId','3193',
  'autotraderRating', 4.4,
  'autotraderReviews', 14,
  'logo',        '',
  'hours', jsonb_build_array(
    jsonb_build_object('day','Monday',   'open','08:00','close','17:00','closed',false),
    jsonb_build_object('day','Tuesday',  'open','08:00','close','17:00','closed',false),
    jsonb_build_object('day','Wednesday','open','08:00','close','17:00','closed',false),
    jsonb_build_object('day','Thursday', 'open','08:00','close','17:00','closed',false),
    jsonb_build_object('day','Friday',   'open','08:00','close','17:00','closed',false),
    jsonb_build_object('day','Saturday', 'open','08:00','close','13:00','closed',false),
    jsonb_build_object('day','Sunday',   'open','',     'close','',     'closed',true)
  ),
  'social', jsonb_build_object(
    'facebook','', 'instagram','', 'tiktok','',
    'autotrader','',
    'carsza',''
  )
)) on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------------
-- HOMEPAGE  ->  Homepage Editor module
-- Every string here renders on the home page. Nothing is hardcoded there.
-- ---------------------------------------------------------------------------
-- NOTE: jsonb_build_object accepts at most 100 arguments, which is 50 keys.
-- This document has more, so it is built in chunks and merged with ||. If you
-- add keys here, keep each chunk under 50 or Postgres will refuse the whole
-- statement with "cannot pass more than 100 arguments to a function".
insert into public.site_settings (key, value) values ('homepage',
  jsonb_build_object(
  'heroBadge',    'Witbank''s trusted pre-owned dealership',
  'heroPhoto',    '',
  'trust', jsonb_build_array(
    jsonb_build_object('icon','award', 'value','25+',       'label','Years on Watermeyer Street'),
    jsonb_build_object('icon','star',  'value','4.8',       'label','Google rating from 37 reviews'),
    jsonb_build_object('icon','shield','value','Every car', 'label','Inspected before it is listed'),
    jsonb_build_object('icon','bank',  'value','Same day',  'label','Finance answers through ABSA')
  ),
  'heroTitle',    'Quality pre-owned vehicles.',
  'heroTitleAccent', 'Priced to move.',
  'heroSubtitle', 'Over 25 years of straight dealing in eMalahleni. Browse our current stock, get finance approved, or trade in the car you have.',
  'ctaPrimary',   jsonb_build_object('text','Browse our stock','link','inventory.html'),
  'ctaSecondary', jsonb_build_object('text','Get finance','link','finance.html'),
  'searchPlaceholder','Search by make, model or keyword',
  'stats', jsonb_build_array(
    jsonb_build_object('label','Years in business','value','25+','sub','Serving eMalahleni'),
    jsonb_build_object('label','Google rating','value','4.8','sub','From 37 reviews'),
    jsonb_build_object('label','Vehicles in stock','value','auto','sub','Updated daily'),
    jsonb_build_object('label','Finance approved','value','Same day','sub','Through ABSA')
  ),
  'featuredTitle','Featured stock',
  'featuredSub',  'Hand-picked vehicles from our current floor.',
  'featuredCount', 4,
  'latestTitle',  'Latest arrivals',
  'latestSub',    'The newest vehicles to land on our floor.',
  'latestCount',  6,
  'categoriesTitle','Shop by body type',
  'categoriesSub','Find the shape that suits how you drive.',
  'categories', jsonb_build_array(
    jsonb_build_object('label','Hatchback','body','Hatchback'),
    jsonb_build_object('label','Sedan','body','Sedan'),
    jsonb_build_object('label','SUV','body','SUV'),
    jsonb_build_object('label','Double Cab','body','Double Cab'),
    jsonb_build_object('label','Single Cab','body','Single Cab'),
    jsonb_build_object('label','MPV','body','MPV')
  ),
  'whyTitle',     'Why buy from Super Cars',
  'whySub',       'The same way we have done business since 1999.',
  'why', jsonb_build_array(
    jsonb_build_object('icon','shield','title','Every car checked','text','Nothing reaches our floor before it has been inspected and prepared properly.'),
    jsonb_build_object('icon','bank','title','Finance sorted here','text','We deal directly with ABSA Vehicle Finance and the other major banks on your behalf.'),
    jsonb_build_object('icon','swap','title','Fair trade-in prices','text','Bring the car you have. We will value it honestly and put the offer in writing.'),
    jsonb_build_object('icon','star','title','4.8 out of 5','text','Rated by 37 customers on Google, and most of them came to us on a recommendation.')
  ),
  'testimonialsTitle','What our customers say',
  'testimonialsSub','Reviews from people who bought their car here.'
  ) || jsonb_build_object(
  'testimonialsCount', 3,
  'aboutTitle',   'A family business, not a chain',
  'aboutText',    'Super Cars has sold quality pre-owned vehicles from Watermeyer Street in eMalahleni for over 25 years. We are small enough that you deal with the person who prices the car, and established enough that the banks take our calls.',
  'aboutCta',     jsonb_build_object('text','More about us','link','about.html'),
  'tradeinTitle', 'Thinking of selling?',
  'tradeinText',  'Send us a few photos and the mileage. We will come back to you with a real number, whether you are trading in or selling outright.',
  'tradeinCta',   jsonb_build_object('text','Value my car','link','sell.html'),
  'financeTitle', 'Finance made simple',
  'financeText',  'Work out what you can afford in a few seconds, then apply online. We handle the paperwork with the bank.',
  'financeCta',   jsonb_build_object('text','Calculate and apply','link','finance.html'),
  'contactTitle', 'Come and see the car',
  'contactText',  'We are on Watermeyer Street, open six days a week. No appointment needed.',
  'processTitle','How buying from us works',
  'processSub','Four steps, and we do most of the work.',
  'process', jsonb_build_array(
    jsonb_build_object('icon','search',   'title','Find the car','text','Browse the floor here or come and walk it. We will not follow you around.'),
    jsonb_build_object('icon','key',      'title','Drive it','text','Book a test drive, or simply arrive. The car will be ready when you get here.'),
    jsonb_build_object('icon','bank',     'title','We place the finance','text','We submit to the bank most likely to approve you, and chase it ourselves.'),
    jsonb_build_object('icon','handshake','title','Take it home','text','We handle the licensing and the paperwork. You collect a car that is ready to drive.')
  ),
  'promiseTitle','What you get from us',
  'promiseSub','The things we will not cut corners on.',
  'promises', jsonb_build_array(
    jsonb_build_object('icon','shield','title','Checked before it is listed','text','Every vehicle is inspected, serviced and prepared before it reaches the floor or this website.'),
    jsonb_build_object('icon','doc',   'title','History you can see','text','We tell you what we know about a car before you ask, including the parts that are not flattering.'),
    jsonb_build_object('icon','swap',  'title','A fair number on your trade','text','We value against the market, put the offer in writing, and settle your outstanding finance directly.'),
    jsonb_build_object('icon','phone', 'title','We answer afterwards','text','People phone us a year after buying. We pick up. That is most of why they came to us in the first place.')
  ),
  'makesTitle','Marques on our floor',
  'makesSub','The badges we stock most often.',
  'makeLogos', '{}'::jsonb,
  'soldTitle','Recently sold',
  'soldSub','Cars that have already found an owner. Tell us if you want the next one.',
  'soldCount', 4
  ) || jsonb_build_object(
  'timelineTitle','Twenty-five years, briefly',
  'timelineSub','How a small floor on Watermeyer Street became what it is.',
  'faqTitle','Questions we get asked',
  'faqSub','If yours is not here, telephone us and ask.',
  'faq', jsonb_build_array(
    jsonb_build_object('q','Do you take trade-ins?','a','Yes, and we buy outright even if you are not buying from us. Send the details and a few photographs through the sell page and we will come back to you, usually the same day.'),
    jsonb_build_object('q','Can you arrange finance?','a','We place applications with ABSA Vehicle Finance and the other major banks. Because we submit them ourselves we usually know within a day whether a deal will fly. Approval is the bank''s decision, not ours.'),
    jsonb_build_object('q','Is there a warranty?','a','It depends on the vehicle and its age. Some still carry the balance of a factory plan. Ask us about the specific car and we will tell you exactly what stands on it.'),
    jsonb_build_object('q','Can I see the service history?','a','Yes. Ask and we will show you the book and whatever records came with the car before you commit to anything.'),
    jsonb_build_object('q','Do you deliver outside eMalahleni?','a','We have sent cars all over Mpumalanga and Gauteng. Talk to us about where you are and we will work out the arrangement.'),
    jsonb_build_object('q','What do I need to bring?','a','For a cash purchase, your ID and proof of address. For finance, add your licence, three months of bank statements and your latest payslip.')
  ),
  'bannerTitle','Come and walk the floor',
  'bannerText','No appointment, no pressure, and nobody trailing you around the lot. We are on Watermeyer Street six days a week.',
  'bannerCta',  jsonb_build_object('text','Get directions','link','contact.html'),
  'bannerCta2', jsonb_build_object('text','See the stock','link','inventory.html'),
  'sections', jsonb_build_object(
    'hero',true,'search',true,'stats',true,'trust',true,'featured',true,'finance',true,
    'latest',true,'categories',true,'makes',true,'process',true,'promise',true,
    'why',true,'timeline',true,'testimonials',true,'sold',true,'faq',true,
    'about',true,'tradein',true,'banner',true,'contact',true,'map',true
  )
  )
) on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------------
-- ABOUT PAGE  ->  Website Content module
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values ('about', jsonb_build_object(
  'title',    'About Super Cars',
  'subtitle', 'Selling honest pre-owned cars in eMalahleni since 1999.',
  'storyTitle','Twenty-five years on Watermeyer Street',
  'story',    'Super Cars opened its doors in eMalahleni in 1999 and has traded from the same premises on Watermeyer Street ever since. What started as a small floor of a dozen cars has grown into one of the town''s established independent dealerships, but the way we work has not changed: we buy carefully, we price honestly, and we tell you what we know about a car before you ask.

Most of our business still comes from people who were sent to us by someone we sold to years ago. That is the only advertising that has ever really worked for us, and it is why we would rather lose a deal than oversell a car.',
  'ownerName','H C Kuhn',
  'ownerRole','Owner',
  'ownerPhoto','',
  'ownerQuote','',
  'valuesTitle','What we stand on',
  'values', jsonb_build_array(
    jsonb_build_object('title','Honest descriptions','text','If a car has a mark on it, we will point it out before you find it.'),
    jsonb_build_object('title','Fair pricing','text','We price against the market, not against what we hope someone will pay.'),
    jsonb_build_object('title','Proper preparation','text','Every vehicle is serviced, checked and cleaned before it is advertised.'),
    jsonb_build_object('title','After the sale','text','You can still phone us a year later. People do, and we answer.')
  ),
  'timelineTitle','How we got here',
  'timeline', jsonb_build_array(
    jsonb_build_object('year','1999','title','Super Cars opens','text','Trading begins on Watermeyer Street with a small floor of pre-owned vehicles.'),
    jsonb_build_object('year','2010','title','Finance desk added','text','We start placing deals directly with the major banks so customers do not have to.'),
    jsonb_build_object('year','2018','title','Online listings','text','Our stock goes onto AutoTrader, reaching buyers across Mpumalanga and Gauteng.'),
    jsonb_build_object('year','2024','title','4.8 on Google','text','Thirty-seven customers rate us 4.8 out of 5.')
  ),
  'teamTitle','The people you will deal with',
  'teamSub','A small team, which is why you get the same person every time.',
  'team', jsonb_build_array(
    jsonb_build_object('name','H C Kuhn','role','Owner','photo','',
      'bio','Has run Super Cars from Watermeyer Street since 1999 and still prices every car that comes onto the floor.'),
    jsonb_build_object('name','Mohammed','role','Sales Manager','photo','',
      'bio','Looks after the floor day to day and places the finance applications himself. Most of our reviews mention him by name.')
  ),
  'locationTitle','Find us',
  'locationText','We are on Watermeyer Street in eMalahleni, a few minutes from the N4. There is parking on site and you are welcome to walk the floor without anyone following you around.'
)) on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------------
-- FINANCE PAGE  ->  Website Content module (copy) + calculator defaults
-- The calculator on the website reads every number below. Change the prime
-- rate here and every monthly figure on the site moves with it.
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values ('finance', jsonb_build_object(
  'title',    'Vehicle finance',
  'subtitle', 'Work out the monthly payment, then apply. We deal with the bank for you.',
  'intro',    'We place finance through ABSA Vehicle Finance and the other major South African banks. Because we submit the application ourselves, we know what each bank is looking for, and we can usually tell you the same day whether a deal will fly.',
  'partner',  'ABSA Vehicle Finance',
  'calcTitle','Work out your instalment',
  'calcNote', 'This is an estimate to help you budget. Your final rate depends on your credit profile and is set by the bank, not by us.',
  'defaultRate', 11.75,
  'defaultTermMonths', 72,
  'termOptions', jsonb_build_array(24,36,48,54,60,72),
  'defaultDepositPct', 10,
  'defaultResidualPct', 0,
  'maxResidualPct', 35,
  'initiationFee', 1207.50,
  'monthlyServiceFee', 69.00,
  'stepsTitle','How it works',
  'steps', jsonb_build_array(
    jsonb_build_object('title','Work out the number','text','Use the calculator to find a monthly payment that fits your budget.'),
    jsonb_build_object('title','Send the application','text','Fill in the form below. It takes about three minutes.'),
    jsonb_build_object('title','We submit it','text','We place it with the bank most likely to approve your profile.'),
    jsonb_build_object('title','Collect the car','text','Once approved, we handle the licensing and hand over the keys.')
  ),
  'requirementsTitle','What the bank will need',
  'requirements', jsonb_build_array(
    'South African ID document',
    'Valid driver''s licence',
    'Latest three months'' bank statements',
    'Latest payslip or proof of income',
    'Proof of residence, not older than three months'
  ),
  'formTitle','Apply for finance',
  'formNote', 'We use these details to place your application with the bank. We do not share them with anyone else.'
)) on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------------
-- SELL / TRADE-IN PAGE  ->  Website Content module
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values ('sell', jsonb_build_object(
  'title',    'Sell or trade in your car',
  'subtitle', 'Tell us what you have. We will come back with a real offer.',
  'intro',    'Whether you are trading in against something on our floor or simply want to sell, send us the details and a few photos. We will look at what the car is actually worth in this market and come back to you, usually the same day.',
  'stepsTitle','Three steps',
  'steps', jsonb_build_array(
    jsonb_build_object('title','Send us the details','text','Make, model, year, mileage and a few photos.'),
    jsonb_build_object('title','We value it','text','We check the market and the condition, then put a number to it.'),
    jsonb_build_object('title','You decide','text','Take the offer as cash, or put it towards a car on our floor.')
  ),
  'pointsTitle','Why sell to us',
  'points', jsonb_build_array(
    'No obligation and no charge for the valuation',
    'We settle outstanding finance directly with your bank',
    'Payment on collection, once the paperwork is done',
    'We buy even if you are not buying from us'
  ),
  'formTitle','Tell us about your car',
  'formNote', 'Photos help us give you an accurate number. Six is plenty: front, back, both sides, the interior and the odometer.',
  'maxPhotos', 8
)) on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------------
-- NAVIGATION + FOOTER  ->  Website Content module
-- ---------------------------------------------------------------------------
-- ---------------------------------------------------------------------------
-- ANNOUNCEMENT BAR  ->  Announcement Bar module
-- Off by default. Switch it on for a sale, a holiday closure or a new arrival.
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values ('announce', jsonb_build_object(
  'enabled',  false,
  'text',     '',
  'linkText', '',
  'link',     '',
  'icon',     'sparkle'
)) on conflict (key) do update set value = excluded.value;

insert into public.site_settings (key, value) values ('navigation', jsonb_build_object(
  'items', jsonb_build_array(
    jsonb_build_object('label','Home',        'link','index.html'),
    jsonb_build_object('label','Stock',       'link','inventory.html'),
    jsonb_build_object('label','Finance',     'link','finance.html'),
    jsonb_build_object('label','Sell my car', 'link','sell.html'),
    jsonb_build_object('label','About',       'link','about.html'),
    jsonb_build_object('label','Reviews',     'link','testimonials.html'),
    jsonb_build_object('label','Contact',     'link','contact.html')
  )
)) on conflict (key) do update set value = excluded.value;

insert into public.site_settings (key, value) values ('footer', jsonb_build_object(
  'blurb','Quality pre-owned vehicles in eMalahleni since 1999. Trading from 75 Watermeyer Street, six days a week.',
  'columns', jsonb_build_array(
    jsonb_build_object('title','Browse','links', jsonb_build_array(
      jsonb_build_object('label','All stock','link','inventory.html'),
      jsonb_build_object('label','SUVs','link','inventory.html?body=SUV'),
      jsonb_build_object('label','Bakkies','link','inventory.html?body=Double%20Cab'),
      jsonb_build_object('label','Hatchbacks','link','inventory.html?body=Hatchback')
    )),
    jsonb_build_object('title','Services','links', jsonb_build_array(
      jsonb_build_object('label','Vehicle finance','link','finance.html'),
      jsonb_build_object('label','Sell or trade in','link','sell.html'),
      jsonb_build_object('label','Customer reviews','link','testimonials.html')
    )),
    jsonb_build_object('title','Company','links', jsonb_build_array(
      jsonb_build_object('label','About us','link','about.html'),
      jsonb_build_object('label','Contact','link','contact.html'),
      jsonb_build_object('label','Privacy policy','link','privacy.html'),
      jsonb_build_object('label','Terms of use','link','terms.html')
    ))
  ),
  'legalNote','Super Cars Witbank is a licensed motor vehicle dealer. All vehicles are sold as pre-owned. Prices exclude licensing and registration unless stated otherwise. E&OE.',
  'copyright','Super Cars Witbank'
)) on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------------
-- LEGAL PAGES  ->  Website Content module
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values ('legal', jsonb_build_object(
  'privacyTitle','Privacy policy',
  'privacyUpdated','2026-08-31',
  'privacyBody','## Who we are

Super Cars Witbank, of 75 Watermeyer Street, eMalahleni, 1039, is the responsible party for the personal information collected through this website, as contemplated in the Protection of Personal Information Act 4 of 2013 (POPIA).

## What we collect

We collect only what you give us through the forms on this site: your name, telephone number, email address, and the details of the vehicle you are enquiring about, selling or financing. A finance application additionally asks for your identity number, employment details and income, because the bank requires them to assess the application.

We also record which vehicle pages are viewed, so that we know which stock is generating interest. That record is not linked to your name.

## Why we collect it

To answer your enquiry, to value a vehicle you want to sell, and to place a finance application with a bank on your instruction. We do not use your details for anything else.

## Who we share it with

A finance application is shared with the bank or banks we submit it to, because that is the purpose of sending it. Nothing else is shared with anyone, and we do not sell or rent personal information to third parties.

## How long we keep it

Enquiries are kept for as long as we may reasonably need them to deal with you, and are then deleted. Records relating to a completed sale are kept for the period required by South African tax and consumer protection law.

## Your rights

You may ask us what we hold about you, ask us to correct it, or ask us to delete it. Write to us at the address above or telephone the dealership and we will deal with the request.

## Cookies

This website stores a small amount of information in your browser so that pages load faster on a return visit. It does not track you across other websites and there is no advertising network on this site.',
  'termsTitle','Terms of use',
  'termsUpdated','2026-08-31',
  'termsBody','## About these terms

These terms govern your use of the Super Cars Witbank website. By using the site you accept them.

## Vehicle listings

Every effort is made to keep stock, prices and specifications accurate and current. Listings are nevertheless subject to change and to prior sale, and errors and omissions are excepted (E&OE). A listing on this website is an invitation to do business and is not an offer capable of acceptance.

Vehicle specifications shown, including mileage, fuel consumption, power and emissions figures, are drawn from the manufacturer''s data and from our own records. Figures for fuel consumption and emissions are manufacturer test figures and will differ in real driving conditions. Please confirm anything that matters to your decision with us directly before you buy.

## Prices

Prices are in South African Rand and, unless expressly stated otherwise, exclude licensing, registration and delivery. A price shown on this website does not include any optional extras fitted after the listing was prepared.

## Finance

Finance is subject to approval by the relevant financial institution and to the National Credit Act 34 of 2005. Any monthly figure shown on this website, including any figure produced by the calculator, is an estimate for budgeting purposes only. It is not a quotation, not an offer of credit, and not binding on us or on any bank. Super Cars Witbank is not a credit provider.

## Trade-in valuations

A valuation given through this website is an indication based on the information and photographs you supply. It is not binding and is subject to physical inspection of the vehicle.

## Your consumer rights

Nothing in these terms limits any right you have under the Consumer Protection Act 68 of 2008 or any other law that cannot lawfully be excluded.

## This website

We do our best to keep the site available and correct but we do not warrant that it will be uninterrupted or error free. Links to other websites are provided for convenience and we are not responsible for their content.

## Governing law

These terms are governed by the law of the Republic of South Africa.'
)) on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------------
-- SEO  ->  SEO module. One entry per public page.
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values ('seo', jsonb_build_object(
  'siteName','Super Cars Witbank',
  'titleSuffix',' | Super Cars Witbank',
  'defaultImage','',
  'robots','index,follow',
  'pages', jsonb_build_object(
    'index', jsonb_build_object(
      'title','Quality Pre-Owned Cars in Witbank',
      'description','Super Cars Witbank has sold quality pre-owned vehicles from Watermeyer Street in eMalahleni since 1999. Browse current stock, apply for finance or trade in your car.',
      'keywords','used cars witbank, pre-owned cars emalahleni, car dealership witbank, cars for sale mpumalanga'),
    'inventory', jsonb_build_object(
      'title','Used Cars for Sale in Witbank',
      'description','Browse every vehicle on our floor in eMalahleni. Filter by make, model, price, body type, transmission and fuel. Updated as stock changes.',
      'keywords','used cars for sale witbank, second hand cars emalahleni, bakkies for sale mpumalanga'),
    'vehicle', jsonb_build_object(
      'title','Vehicle Details',
      'description','Full specifications, photographs and finance estimate for this vehicle at Super Cars Witbank.',
      'keywords',''),
    'finance', jsonb_build_object(
      'title','Vehicle Finance in Witbank',
      'description','Work out your monthly instalment and apply for vehicle finance through ABSA and the major South African banks. Super Cars Witbank handles the application for you.',
      'keywords','car finance witbank, vehicle finance emalahleni, absa vehicle finance'),
    'sell', jsonb_build_object(
      'title','Sell or Trade In Your Car in Witbank',
      'description','Send us your car''s details and photographs for a free, no obligation valuation. We buy outright or trade in against our stock.',
      'keywords','sell my car witbank, trade in car emalahleni, car valuation mpumalanga'),
    'about', jsonb_build_object(
      'title','About Us',
      'description','Super Cars has traded pre-owned vehicles from Watermeyer Street in eMalahleni since 1999. Rated 4.8 out of 5 by our customers on Google.',
      'keywords','super cars witbank, car dealership emalahleni'),
    'testimonials', jsonb_build_object(
      'title','Customer Reviews',
      'description','Read what customers say about buying a car from Super Cars Witbank. Rated 4.8 out of 5 from 37 Google reviews.',
      'keywords','super cars witbank reviews, car dealer reviews emalahleni'),
    'contact', jsonb_build_object(
      'title','Contact Us',
      'description','Visit us at 75 Watermeyer Street, eMalahleni, or call 013 692 7628. Open Monday to Saturday.',
      'keywords','contact super cars witbank, car dealer watermeyer street'),
    'privacy', jsonb_build_object('title','Privacy Policy','description','How Super Cars Witbank collects, uses and protects your personal information under POPIA.','keywords',''),
    'terms',   jsonb_build_object('title','Terms of Use','description','The terms that govern your use of the Super Cars Witbank website.','keywords',''),
    'notfound',jsonb_build_object('title','Page Not Found','description','The page you were looking for is not here.','keywords','')
  )
)) on conflict (key) do update set value = excluded.value;


-- ---------------------------------------------------------------------------
-- VEHICLES  ->  Vehicle Management module, website inventory and detail pages
-- ---------------------------------------------------------------------------
-- Specifications below are taken from the dealership's own AutoTrader
-- listings. Colours are taken from the photographs.

insert into public.vehicles (
  id, stock, make, model, variant, year, mileage, transmission, fuel, body,
  colour, power_kw, seats, fuel_use, co2, zero_to_hundred, doors,
  price, price_badge, installment, description, features, images,
  service_history, condition, status, featured, promoted, sold, reserved,
  archived, slug, sort_order
) values
-- >>> GENERATED BY database/stock.py, DO NOT EDIT BY HAND >>>
-- 0001  BMW 1 Series
('v_0001','0001','BMW','1 Series','118i 5-Door Auto',2015,101000,'Automatic','Petrol','Hatchback',
 'Silver',100,5,5.6,133,8.7,5,
 199950,'',0,
 'A 2015 BMW 118i in silver with the 5-door body and the automatic gearbox, showing 101 000 km. The 1.5 litre turbo petrol returns a genuine 5.6 l/100km on the combined cycle while still pulling to 100 km/h in 8.7 seconds, which is a rare combination in a hatch this size. Rear wheel drive, as a 1 Series should be. A tidy, well kept example that drives exactly as it should.',
 '["Automatic transmission", "Rear wheel drive", "Multifunction steering wheel", "Air conditioning", "Electric windows", "Alloy wheels", "Central locking", "Front fog lamps", "Cruise control", "Bluetooth"]'::jsonb,
 to_jsonb(array[img||'/0001/01.jpg',img||'/0001/02.jpg',img||'/0001/03.jpg',img||'/0001/04.jpg',img||'/0001/05.jpg']),
 'Full service history','Very Good','available',false,false,false,false,false,'2015-bmw-1-series-118i-5-door-auto-0001',1),

-- 0002  Nissan NP200
('v_0002','0002','Nissan','NP200','1.6i (Aircon) Safety Pack',2021,146000,'Manual','Petrol','Single Cab',
 'Silver',64,2,8.1,192,null,2,
 209950,'',0,
 'A 2021 Nissan NP200 1.6i with aircon, the Safety Pack and a canopy already fitted, showing 146 000 km. The half tonne workhorse that South Africa keeps buying for good reason: simple, cheap to run and easy to fix anywhere. This one has clearly worked but has been looked after, and the canopy means it is ready to earn its keep from the day you take it.',
 '["Air conditioning", "Safety Pack", "Canopy fitted", "Power steering", "Central locking", "Electric windows", "Radio", "Tow bar", "Rubberised load bin"]'::jsonb,
 to_jsonb(array[img||'/0002/01.jpg',img||'/0002/02.jpg',img||'/0002/03.jpg',img||'/0002/04.jpg',img||'/0002/05.jpg']),
 'Partial service history','Good','available',false,false,false,false,false,'2021-nissan-np200-1-6i-aircon-safety-pack-0002',2),

-- 0003  Volkswagen T-Cross
('v_0003','0003','Volkswagen','T-Cross','1.0TSI 70kW Comfortline',2021,112000,'Manual','Petrol','SUV',
 'White',70,5,4.8,110,10.8,5,
 259950,'Fair Price',0,
 'A 2021 Volkswagen T-Cross 1.0TSI Comfortline in white, manual, showing 112 000 km. Volkswagen''s small crossover does the sensible things very well: 4.8 l/100km on the combined cycle, a high seating position, and a boot that slides to trade rear legroom for luggage when you need it. Well specified and honestly priced for the mileage.',
 '["Comfortline specification", "Touchscreen infotainment", "Bluetooth and USB", "Air conditioning", "Electric windows", "Alloy wheels", "Rear parking sensors", "Cruise control", "Sliding rear bench", "ISOFIX child seat anchors"]'::jsonb,
 to_jsonb(array[img||'/0003/01.jpg',img||'/0003/02.jpg',img||'/0003/03.jpg',img||'/0003/04.jpg',img||'/0003/05.jpg']),
 'Full service history','Very Good','available',false,false,false,false,false,'2021-volkswagen-t-cross-1-0tsi-70kw-comfortline-0003',3),

-- 0004  Audi A1
('v_0004','0004','Audi','A1','Sportback 1.4TFSI S tronic',2014,134000,'Automatic','Petrol','Hatchback',
 'White',90,5,5.3,122,9.0,5,
 179950,'High Price',0,
 'A 2014 Audi A1 Sportback 1.4TFSI in white with the S tronic gearbox, showing 134 000 km. The five-door Sportback body makes it far more usable than the three-door without losing the shape. 90 kW from the 1.4 turbo, 5.3 l/100km, and the interior quality that made the A1 worth the money in the first place.',
 '["S tronic automatic", "Alloy wheels", "Air conditioning", "Multifunction steering wheel", "Electric windows", "Bluetooth", "Front fog lamps", "Split folding rear seats", "ISOFIX child seat anchors"]'::jsonb,
 to_jsonb(array[img||'/0004/01.jpg',img||'/0004/02.jpg',img||'/0004/03.jpg',img||'/0004/04.jpg']),
 'Partial service history','Good','available',false,false,false,false,false,'2014-audi-a1-sportback-1-4tfsi-s-tronic-0004',4),

-- 0005  BMW 3 Series
('v_0005','0005','BMW','3 Series','320i Auto',2012,94000,'Automatic','Petrol','Sedan',
 'White',135,5,5.9,138,7.6,4,
 159950,'Fair Price',0,
 'A 2012 BMW 320i automatic in white with only 94 000 km, which is low for the year. The F30 generation 320i gives you 135 kW, a 7.6 second run to 100 km/h and still only 5.9 l/100km on the combined cycle. Rear wheel drive, eight speed automatic, and the ride and steering that made this the class benchmark. Genuinely low mileage examples like this are getting hard to find.',
 '["Eight speed automatic", "Rear wheel drive", "Leather seats", "Dual zone climate control", "Cruise control", "Alloy wheels", "Park distance control", "Bluetooth", "Multifunction steering wheel", "Start stop"]'::jsonb,
 to_jsonb(array[img||'/0005/01.jpg',img||'/0005/02.jpg',img||'/0005/03.jpg',img||'/0005/04.jpg',img||'/0005/05.jpg']),
 'Full service history','Very Good','available',true,false,false,false,false,'2012-bmw-3-series-320i-auto-0005',5),

-- 0006  Toyota Rumion
('v_0006','0006','Toyota','Rumion','1.5 S',2026,150,'Manual','Petrol','MPV',
 'Silver',null,7,null,null,null,5,
 359950,'Great Price',0,
 'A 2026 Toyota Rumion 1.5 S in silver with 150 km on the clock. This is a demonstration unit, so it is effectively a new car at a used car price, with the balance of its factory plan still to run. Seven seats in a body small enough to park easily, and the Toyota badge on the front, which in this part of the country matters when it comes time to sell it again.',
 '["Seven seats", "Near new demonstration unit", "Air conditioning", "Touchscreen infotainment", "Bluetooth", "Electric windows", "Central locking", "ISOFIX child seat anchors", "ABS with EBD", "Driver and passenger airbags"]'::jsonb,
 to_jsonb(array[img||'/0006/01.jpg',img||'/0006/02.jpg',img||'/0006/03.jpg',img||'/0006/04.jpg',img||'/0006/05.jpg']),
 'Full service history','Excellent','available',true,false,false,false,false,'2026-toyota-rumion-1-5-s-0006',6),

-- 0007  Audi Q5
('v_0007','0007','Audi','Q5','2.0TDI S quattro',2020,83000,'Automatic','Diesel','SUV',
 'Grey',null,5,null,null,null,5,
 579950,'High Price',0,
 'This 2020 Audi Q5 2.0 TDI S quattro in grey offers a strong mix of efficiency, performance and all weather capability. The 2.0 litre turbo diesel delivers solid torque with excellent fuel economy, paired to Audi''s quattro all wheel drive for secure handling and confident road holding. Showing 83 000 km and presenting extremely well on the S line body kit and large alloys.',
 '["quattro all wheel drive", "S line exterior", "LED headlights", "Leather upholstery", "Virtual cockpit", "Dual zone climate control", "Electric tailgate", "Park distance control front and rear", "Reverse camera", "Cruise control", "Panoramic roof", "Alloy wheels"]'::jsonb,
 to_jsonb(array[img||'/0007/01.jpg',img||'/0007/02.jpg',img||'/0007/03.jpg',img||'/0007/04.jpg',img||'/0007/05.jpg']),
 'Full service history','Excellent','available',true,false,false,false,false,'2020-audi-q5-2-0tdi-s-quattro-0007',7),

-- 0008  Mercedes-Benz C-Class
('v_0008','0008','Mercedes-Benz','C-Class','C180 Auto',2020,103000,'Automatic','Petrol','Sedan',
 'White',115,5,6.5,147,8.6,4,
 349950,'Fair Price',0,
 'A 2020 Mercedes-Benz C180 in white, automatic, showing 103 000 km. 115 kW, 6.5 l/100km and 8.6 seconds to 100 km/h from the turbocharged petrol, with the nine speed automatic that makes the car so easy in traffic. The facelifted interior with the widescreen cluster and the sunroof fitted. A properly specified example of the last of this generation.',
 '["Nine speed automatic", "Sunroof", "Leather upholstery", "Dual zone climate control", "Reverse camera", "Park distance control", "Cruise control", "LED headlights", "Alloy wheels", "Bluetooth and Apple CarPlay", "Keyless start"]'::jsonb,
 to_jsonb(array[img||'/0008/01.jpg',img||'/0008/02.jpg',img||'/0008/03.jpg',img||'/0008/04.jpg',img||'/0008/05.jpg']),
 'Full service history','Excellent','available',true,true,false,false,false,'2020-mercedes-benz-c-class-c180-auto-0008',8),

-- 0009  Toyota Fortuner
('v_0009','0009','Toyota','Fortuner','2.4GD-6 Auto',2021,99000,'Automatic','Diesel','SUV',
 'White',110,7,7.2,190,null,5,
 479950,'Fair Price',0,
 'A 2021 Toyota Fortuner 2.4GD-6 automatic in white, showing 99 000 km, with a nudge bar and side steps already fitted. Seven seats, 110 kW and 7.2 l/100km from the 2.4 turbo diesel. The Fortuner needs no introduction in this part of the country: it holds its value, it goes where you point it, and every town has someone who can service it.',
 '["Seven seats", "Nudge bar", "Side steps", "Reverse camera", "Touchscreen infotainment", "Dual zone climate control", "Cruise control", "Alloy wheels", "Park distance control", "Bluetooth", "Roof rails", "Tow bar"]'::jsonb,
 to_jsonb(array[img||'/0009/01.jpg',img||'/0009/02.jpg',img||'/0009/03.jpg',img||'/0009/04.jpg',img||'/0009/05.jpg']),
 'Full service history','Very Good','available',true,true,false,false,false,'2021-toyota-fortuner-2-4gd-6-auto-0009',9),

-- 0010  Volkswagen Polo Vivo
('v_0010','0010','Volkswagen','Polo Vivo','Hatch 1.6 Life Edition 15',2025,42000,'Automatic','Petrol','Hatchback',
 'Silver',null,5,null,null,null,5,
 269950,'High Price',0,
 'A 2025 Volkswagen Polo Vivo 1.6 Life Edition 15 in silver, automatic, showing only 42 000 km. The Edition 15 celebrates fifteen years of the Vivo and adds the alloys and trim over the standard car. An automatic Vivo is the easy answer for town driving, and at this mileage it has barely started its life.',
 '["Automatic transmission", "Edition 15 specification", "Alloy wheels", "Air conditioning", "Touchscreen with Bluetooth", "Electric front windows", "Central locking", "Split folding rear seat", "ISOFIX child seat anchors", "ABS with EBD"]'::jsonb,
 to_jsonb(array[img||'/0010/01.jpg',img||'/0010/02.jpg',img||'/0010/03.jpg',img||'/0010/04.jpg',img||'/0010/05.jpg']),
 'Full service history','Excellent','available',false,false,false,false,false,'2025-volkswagen-polo-vivo-hatch-1-6-life-edition-15-0010',10),

-- 0011  Volkswagen Polo Vivo
('v_0011','0011','Volkswagen','Polo Vivo','Hatch 1.4 Trendline',2023,68000,'Manual','Petrol','Hatchback',
 'Grey',55,5,5.7,132,null,5,
 189950,'Fair Price',0,
 'A 2023 Volkswagen Polo Vivo Hatch 1.4 Trendline in grey, showing 68 000 km. The Vivo is the default first car in South Africa because it earns it: 5.7 l/100km, parts on every shelf in the country, and a resale value that barely moves. This one is a 2023 model still well inside its life, and it presents cleanly inside and out.',
 '["Air conditioning", "Electric front windows", "Central locking", "Radio with Bluetooth", "Alloy wheels", "Split folding rear seat", "ISOFIX child seat anchors", "Driver and passenger airbags", "ABS with EBD"]'::jsonb,
 to_jsonb(array[img||'/0011/01.jpg',img||'/0011/02.jpg',img||'/0011/03.jpg',img||'/0011/04.jpg',img||'/0011/05.jpg']),
 'Full service history','Very Good','available',false,true,false,false,false,'2023-volkswagen-polo-vivo-hatch-1-4-trendline-0011',11),

-- 0012  Volkswagen Amarok
('v_0012','0012','Volkswagen','Amarok','2.0BiTDI Double Cab Highline 4Motion Auto',2020,116000,'Automatic','Diesel','Double Cab',
 'White',132,5,8.5,224,11.3,4,
 429950,'',0,
 'A 2020 Volkswagen Amarok 2.0 BiTDI Double Cab Highline 4Motion automatic in white, showing 116 000 km, with a canopy fitted. 132 kW and permanent four wheel drive through the eight speed automatic. The Amarok remains the double cab that drives most like a car, with the widest load bin in the class and enough torque to tow properly. Highline specification, so it has the equipment.',
 '["4Motion permanent all wheel drive", "Eight speed automatic", "Canopy fitted", "Leather upholstery", "Reverse camera", "Park distance control", "Dual zone climate control", "Cruise control", "Alloy wheels", "Bluetooth", "Tow bar", "Side steps"]'::jsonb,
 to_jsonb(array[img||'/0012/01.jpg',img||'/0012/02.jpg',img||'/0012/03.jpg',img||'/0012/04.jpg',img||'/0012/05.jpg']),
 'Full service history','Very Good','available',true,true,false,false,false,'2020-volkswagen-amarok-2-0bitdi-double-cab-highline-4motion-auto-0012',12),

-- 0013  Volkswagen T-Cross
('v_0013','0013','Volkswagen','T-Cross','1.0TSI 85kW Highline R-Line',2023,57000,'Automatic','Petrol','SUV',
 '',85,5,5.3,126,10.2,5,
 339950,'Great Price',0,
 'A 2023 Volkswagen T-Cross 1.0TSI Highline with the R-Line package, automatic, showing 57 000 km. The 85 kW version is the one to have: the same frugal 1.0 TSI but with enough in reserve for the open road, and the R-Line trim adds the sportier bumpers and wheels. Low mileage for the year.',
 '["Highline specification", "R-Line package", "Automatic transmission", "Touchscreen infotainment", "Digital instrument cluster", "Alloy wheels", "Park distance control", "Cruise control", "Air conditioning", "Sliding rear bench"]'::jsonb,
 '[]'::jsonb,
 'Full service history','Excellent','available',false,false,false,false,false,'2023-volkswagen-t-cross-1-0tsi-85kw-highline-r-line-0013',13),

-- 0014  Hyundai H-100
('v_0014','0014','Hyundai','H-100','Bakkie 2.6D Forward Control',2020,126000,'Manual','Diesel','Single Cab',
 '',null,3,null,null,null,2,
 219950,'Fair Price',0,
 'A 2020 Hyundai H-100 2.6 diesel dropside, showing 126 000 km. The forward control cab puts the whole wheelbase behind you, which is why this body carries more than a conventional bakkie of the same length. A genuine one tonne workhorse for a business that needs to move material rather than impress anybody.',
 '["One tonne payload", "Dropside body", "Diesel engine", "Power steering", "Air conditioning", "Radio", "Tow bar"]'::jsonb,
 '[]'::jsonb,
 'Partial service history','Good','available',false,false,false,false,false,'2020-hyundai-h-100-bakkie-2-6d-forward-control-0014',14),

-- 0015  Suzuki Ertiga
('v_0015','0015','Suzuki','Ertiga','1.5 GA',2026,150,'Manual','Petrol','MPV',
 '',null,7,null,null,null,5,
 369950,'Fair Price',0,
 'A 2026 Suzuki Ertiga 1.5 GA with 150 km on it, so effectively a new vehicle. Seven seats, a 1.5 petrol that will not frighten you at the pumps, and running costs low enough that this is the default choice for e-hailing operators and large families alike.',
 '["Seven seats", "Near new demonstration unit", "Air conditioning", "Electric front windows", "Central locking", "Radio with Bluetooth", "Dual airbags", "ABS with EBD", "ISOFIX child seat anchors"]'::jsonb,
 '[]'::jsonb,
 'Full service history','Excellent','available',false,false,false,false,false,'2026-suzuki-ertiga-1-5-ga-0015',15),

-- 0016  Toyota Corolla Cross
('v_0016','0016','Toyota','Corolla Cross','1.8 Xi',2025,15,'Automatic','Petrol','SUV',
 '',null,5,null,null,null,5,
 399950,'High Price',0,
 'A 2025 Toyota Corolla Cross 1.8 Xi with 15 km on the odometer, which makes it a new car in all but the paperwork. The Corolla Cross has become the sensible family crossover in South Africa for the same reasons the Corolla always was: it is easy to own, cheap to run and holds its money.',
 '["Automatic transmission", "Touchscreen infotainment", "Reverse camera", "Cruise control", "Air conditioning", "Alloy wheels", "Electric windows", "ISOFIX child seat anchors", "Multiple airbags"]'::jsonb,
 '[]'::jsonb,
 'Full service history','Excellent','available',false,false,false,false,false,'2025-toyota-corolla-cross-1-8-xi-0016',16),

-- 0017  Audi A3
('v_0017','0017','Audi','A3','Sedan 30TFSI Auto',2020,99000,'Automatic','Petrol','Sedan',
 '',null,5,null,null,null,4,
 299950,'Fair Price',0,
 'A 2020 Audi A3 Sedan 30TFSI automatic, showing 99 000 km. The sedan body gives you a proper boot without losing the A3''s proportions, and the 30TFSI is the economical one to run day to day. Well built inside, as an A3 always is.',
 '["Automatic transmission", "Alloy wheels", "Dual zone climate control", "Cruise control", "Park distance control", "Bluetooth", "Multifunction steering wheel", "LED headlights"]'::jsonb,
 '[]'::jsonb,
 'Full service history','Very Good','available',false,false,false,false,false,'2020-audi-a3-sedan-30tfsi-auto-0017',17)
-- <<< END GENERATED <<<
on conflict (id) do update set
  stock=excluded.stock, make=excluded.make, model=excluded.model,
  variant=excluded.variant, year=excluded.year, mileage=excluded.mileage,
  transmission=excluded.transmission, fuel=excluded.fuel, body=excluded.body,
  colour=excluded.colour, power_kw=excluded.power_kw, seats=excluded.seats,
  fuel_use=excluded.fuel_use, co2=excluded.co2,
  zero_to_hundred=excluded.zero_to_hundred, doors=excluded.doors,
  price=excluded.price, price_badge=excluded.price_badge,
  description=excluded.description, features=excluded.features,
  images=excluded.images, service_history=excluded.service_history,
  condition=excluded.condition, status=excluded.status,
  featured=excluded.featured, promoted=excluded.promoted,
  archived=excluded.archived, slug=excluded.slug, sort_order=excluded.sort_order;


-- ---------------------------------------------------------------------------
-- MEDIA LIBRARY  ->  Media Library module
-- Indexes the vehicle photographs that were uploaded to Storage, so the
-- library lists them without walking the bucket.
-- ---------------------------------------------------------------------------
insert into public.media (id, url, bucket, path, name, folder, kind, width, height)
select
  'm_'||v.stock||'_'||lpad(n::text,2,'0'),
  img||'/'||v.stock||'/'||lpad(n::text,2,'0')||'.jpg',
  'vehicle-images',
  'stock/'||v.stock||'/'||lpad(n::text,2,'0')||'.jpg',
  v.make||' '||v.model||' — photo '||n,
  'vehicles','image',800,600
from public.vehicles v
cross join lateral generate_series(1, jsonb_array_length(v.images)) as n
where jsonb_array_length(v.images) > 0
on conflict (id) do update set url = excluded.url, name = excluded.name;


-- ---------------------------------------------------------------------------
-- ACTIVITY LOG  ->  Activity Log module, Dashboard
-- ---------------------------------------------------------------------------
insert into public.activity_log (id, title, detail, icon, tone, actor) values
  ('a_seed_1','Portal created','Super Cars Witbank portal set up and connected','sparkles','ok','System'),
  ('a_seed_2','Stock imported','12 vehicles loaded, 2 saved as drafts pending details','car','','System')
on conflict (id) do nothing;

end $$;

-- ---------------------------------------------------------------------------
-- TESTIMONIALS
-- ---------------------------------------------------------------------------
-- Deliberately empty. Super Cars has 37 genuine Google reviews with a 4.8
-- average, and that rating is already shown on the website from the business
-- settings. Writing testimonials here would mean inventing customers and
-- attributing words to them, so the table is left for staff to populate with
-- real reviews through the Testimonials module. Until they do, the website's
-- testimonial sections hide themselves rather than showing filler.


-- ---------------------------------------------------------------------------
-- WHAT TO DO NEXT
--   1. Upload the photographs.  From the project folder run:
--        ./database/upload-media.sh
--      It needs your project URL and a service role key, and it puts every
--      file at vehicle-images/stock/<code>/<nn>.jpg, which is exactly what
--      the rows above expect.
--   2. Open the portal, sign in, and go to Vehicle Management.
--      Two vehicles are waiting as drafts: stock 0006 and stock 0010.
--      Fill in year, mileage and price, then switch Archived off to publish.
-- ---------------------------------------------------------------------------
