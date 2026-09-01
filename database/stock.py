#!/usr/bin/env python3
"""
SUPER CARS WITBANK  ·  Canonical stock list

The single definition of the dealership's vehicles. Running this file
regenerates BOTH:

    database/02-seed.sql        the vehicle rows
    js/fallback.js              the vehicle rows

so the two can never disagree. Edit the list here, run the file, and both
outputs are rewritten between their generated markers.

    python3 database/stock.py

Specifications come from the dealership's own AutoTrader listings and from
the business report. Colours come from the photographs. Anything not known
is left as None and is simply omitted on the website rather than guessed.

photos = how many pictures exist in assets/stock/<code>/. Zero means the car
is real and listed but has not been photographed yet; the site shows a
placeholder and the portal flags it.
"""

V = [
  dict(code='0001', photos=5,
       make='BMW', model='1 Series', variant='118i 5-Door Auto', year=2015,
       km=101000, trans='Automatic', fuel='Petrol', body='Hatchback',
       colour='Silver', kw=100, seats=5, l100=5.6, co2=133, zero=8.7, doors=5,
       price=199950, badge='', featured=False, promoted=False,
       history='Full service history', cond='Very Good',
       desc="A 2015 BMW 118i in silver with the 5-door body and the automatic gearbox, "
            "showing 101 000 km. The 1.5 litre turbo petrol returns a genuine 5.6 l/100km "
            "on the combined cycle while still pulling to 100 km/h in 8.7 seconds, which is "
            "a rare combination in a hatch this size. Rear wheel drive, as a 1 Series should "
            "be. A tidy, well kept example that drives exactly as it should.",
       features=['Automatic transmission','Rear wheel drive','Multifunction steering wheel',
                 'Air conditioning','Electric windows','Alloy wheels','Central locking',
                 'Front fog lamps','Cruise control','Bluetooth']),

  dict(code='0002', photos=5,
       make='Nissan', model='NP200', variant='1.6i (Aircon) Safety Pack', year=2021,
       km=146000, trans='Manual', fuel='Petrol', body='Single Cab',
       colour='Silver', kw=64, seats=2, l100=8.1, co2=192, zero=None, doors=2,
       price=209950, badge='', featured=False, promoted=False,
       history='Partial service history', cond='Good',
       desc="A 2021 Nissan NP200 1.6i with aircon, the Safety Pack and a canopy already "
            "fitted, showing 146 000 km. The half tonne workhorse that South Africa keeps "
            "buying for good reason: simple, cheap to run and easy to fix anywhere. This one "
            "has clearly worked but has been looked after, and the canopy means it is ready "
            "to earn its keep from the day you take it.",
       features=['Air conditioning','Safety Pack','Canopy fitted','Power steering',
                 'Central locking','Electric windows','Radio','Tow bar','Rubberised load bin']),

  dict(code='0003', photos=5,
       make='Volkswagen', model='T-Cross', variant='1.0TSI 70kW Comfortline', year=2021,
       km=112000, trans='Manual', fuel='Petrol', body='SUV',
       colour='White', kw=70, seats=5, l100=4.8, co2=110, zero=10.8, doors=5,
       price=259950, badge='Fair Price', featured=False, promoted=False,
       history='Full service history', cond='Very Good',
       desc="A 2021 Volkswagen T-Cross 1.0TSI Comfortline in white, manual, showing "
            "112 000 km. Volkswagen's small crossover does the sensible things very well: "
            "4.8 l/100km on the combined cycle, a high seating position, and a boot that "
            "slides to trade rear legroom for luggage when you need it. Well specified and "
            "honestly priced for the mileage.",
       features=['Comfortline specification','Touchscreen infotainment','Bluetooth and USB',
                 'Air conditioning','Electric windows','Alloy wheels','Rear parking sensors',
                 'Cruise control','Sliding rear bench','ISOFIX child seat anchors']),

  dict(code='0004', photos=4,
       make='Audi', model='A1', variant='Sportback 1.4TFSI S tronic', year=2014,
       km=134000, trans='Automatic', fuel='Petrol', body='Hatchback',
       colour='White', kw=90, seats=5, l100=5.3, co2=122, zero=9.0, doors=5,
       price=179950, badge='High Price', featured=False, promoted=False,
       history='Partial service history', cond='Good',
       desc="A 2014 Audi A1 Sportback 1.4TFSI in white with the S tronic gearbox, showing "
            "134 000 km. The five-door Sportback body makes it far more usable than the "
            "three-door without losing the shape. 90 kW from the 1.4 turbo, 5.3 l/100km, and "
            "the interior quality that made the A1 worth the money in the first place.",
       features=['S tronic automatic','Alloy wheels','Air conditioning',
                 'Multifunction steering wheel','Electric windows','Bluetooth',
                 'Front fog lamps','Split folding rear seats','ISOFIX child seat anchors']),

  dict(code='0005', photos=5,
       make='BMW', model='3 Series', variant='320i Auto', year=2012,
       km=94000, trans='Automatic', fuel='Petrol', body='Sedan',
       colour='White', kw=135, seats=5, l100=5.9, co2=138, zero=7.6, doors=4,
       price=159950, badge='Fair Price', featured=True, promoted=False,
       history='Full service history', cond='Very Good',
       desc="A 2012 BMW 320i automatic in white with only 94 000 km, which is low for the "
            "year. The F30 generation 320i gives you 135 kW, a 7.6 second run to 100 km/h "
            "and still only 5.9 l/100km on the combined cycle. Rear wheel drive, eight speed "
            "automatic, and the ride and steering that made this the class benchmark. "
            "Genuinely low mileage examples like this are getting hard to find.",
       features=['Eight speed automatic','Rear wheel drive','Leather seats',
                 'Dual zone climate control','Cruise control','Alloy wheels',
                 'Park distance control','Bluetooth','Multifunction steering wheel','Start stop']),

  dict(code='0006', photos=5,
       make='Toyota', model='Rumion', variant='1.5 S', year=2026,
       km=150, trans='Manual', fuel='Petrol', body='MPV',
       colour='Silver', kw=None, seats=7, l100=None, co2=None, zero=None, doors=5,
       price=359950, badge='Great Price', featured=True, promoted=False,
       history='Full service history', cond='Excellent',
       desc="A 2026 Toyota Rumion 1.5 S in silver with 150 km on the clock. This is a "
            "demonstration unit, so it is effectively a new car at a used car price, with "
            "the balance of its factory plan still to run. Seven seats in a body small "
            "enough to park easily, and the Toyota badge on the front, which in this part of "
            "the country matters when it comes time to sell it again.",
       features=['Seven seats','Near new demonstration unit','Air conditioning',
                 'Touchscreen infotainment','Bluetooth','Electric windows','Central locking',
                 'ISOFIX child seat anchors','ABS with EBD','Driver and passenger airbags']),

  dict(code='0007', photos=5,
       make='Audi', model='Q5', variant='2.0TDI S quattro', year=2020,
       km=83000, trans='Automatic', fuel='Diesel', body='SUV',
       colour='Grey', kw=None, seats=5, l100=None, co2=None, zero=None, doors=5,
       price=579950, badge='High Price', featured=True, promoted=False,
       history='Full service history', cond='Excellent',
       desc="This 2020 Audi Q5 2.0 TDI S quattro in grey offers a strong mix of efficiency, "
            "performance and all weather capability. The 2.0 litre turbo diesel delivers "
            "solid torque with excellent fuel economy, paired to Audi's quattro all wheel "
            "drive for secure handling and confident road holding. Showing 83 000 km and "
            "presenting extremely well on the S line body kit and large alloys.",
       features=['quattro all wheel drive','S line exterior','LED headlights',
                 'Leather upholstery','Virtual cockpit','Dual zone climate control',
                 'Electric tailgate','Park distance control front and rear','Reverse camera',
                 'Cruise control','Panoramic roof','Alloy wheels']),

  dict(code='0008', photos=5,
       make='Mercedes-Benz', model='C-Class', variant='C180 Auto', year=2020,
       km=103000, trans='Automatic', fuel='Petrol', body='Sedan',
       colour='White', kw=115, seats=5, l100=6.5, co2=147, zero=8.6, doors=4,
       price=349950, badge='Fair Price', featured=True, promoted=True,
       history='Full service history', cond='Excellent',
       desc="A 2020 Mercedes-Benz C180 in white, automatic, showing 103 000 km. 115 kW, "
            "6.5 l/100km and 8.6 seconds to 100 km/h from the turbocharged petrol, with the "
            "nine speed automatic that makes the car so easy in traffic. The facelifted "
            "interior with the widescreen cluster and the sunroof fitted. A properly "
            "specified example of the last of this generation.",
       features=['Nine speed automatic','Sunroof','Leather upholstery',
                 'Dual zone climate control','Reverse camera','Park distance control',
                 'Cruise control','LED headlights','Alloy wheels',
                 'Bluetooth and Apple CarPlay','Keyless start']),

  dict(code='0009', photos=5,
       make='Toyota', model='Fortuner', variant='2.4GD-6 Auto', year=2021,
       km=99000, trans='Automatic', fuel='Diesel', body='SUV',
       colour='White', kw=110, seats=7, l100=7.2, co2=190, zero=None, doors=5,
       price=479950, badge='Fair Price', featured=True, promoted=True,
       history='Full service history', cond='Very Good',
       desc="A 2021 Toyota Fortuner 2.4GD-6 automatic in white, showing 99 000 km, with a "
            "nudge bar and side steps already fitted. Seven seats, 110 kW and 7.2 l/100km "
            "from the 2.4 turbo diesel. The Fortuner needs no introduction in this part of "
            "the country: it holds its value, it goes where you point it, and every town has "
            "someone who can service it.",
       features=['Seven seats','Nudge bar','Side steps','Reverse camera',
                 'Touchscreen infotainment','Dual zone climate control','Cruise control',
                 'Alloy wheels','Park distance control','Bluetooth','Roof rails','Tow bar']),

  dict(code='0010', photos=5,
       make='Volkswagen', model='Polo Vivo', variant='Hatch 1.6 Life Edition 15', year=2025,
       km=42000, trans='Automatic', fuel='Petrol', body='Hatchback',
       colour='Silver', kw=None, seats=5, l100=None, co2=None, zero=None, doors=5,
       price=269950, badge='High Price', featured=False, promoted=False,
       history='Full service history', cond='Excellent',
       desc="A 2025 Volkswagen Polo Vivo 1.6 Life Edition 15 in silver, automatic, showing "
            "only 42 000 km. The Edition 15 celebrates fifteen years of the Vivo and adds "
            "the alloys and trim over the standard car. An automatic Vivo is the easy answer "
            "for town driving, and at this mileage it has barely started its life.",
       features=['Automatic transmission','Edition 15 specification','Alloy wheels',
                 'Air conditioning','Touchscreen with Bluetooth','Electric front windows',
                 'Central locking','Split folding rear seat','ISOFIX child seat anchors',
                 'ABS with EBD']),

  dict(code='0011', photos=5,
       make='Volkswagen', model='Polo Vivo', variant='Hatch 1.4 Trendline', year=2023,
       km=68000, trans='Manual', fuel='Petrol', body='Hatchback',
       colour='Grey', kw=55, seats=5, l100=5.7, co2=132, zero=None, doors=5,
       price=189950, badge='Fair Price', featured=False, promoted=True,
       history='Full service history', cond='Very Good',
       desc="A 2023 Volkswagen Polo Vivo Hatch 1.4 Trendline in grey, showing 68 000 km. "
            "The Vivo is the default first car in South Africa because it earns it: "
            "5.7 l/100km, parts on every shelf in the country, and a resale value that "
            "barely moves. This one is a 2023 model still well inside its life, and it "
            "presents cleanly inside and out.",
       features=['Air conditioning','Electric front windows','Central locking',
                 'Radio with Bluetooth','Alloy wheels','Split folding rear seat',
                 'ISOFIX child seat anchors','Driver and passenger airbags','ABS with EBD']),

  dict(code='0012', photos=5,
       make='Volkswagen', model='Amarok',
       variant='2.0BiTDI Double Cab Highline 4Motion Auto', year=2020,
       km=116000, trans='Automatic', fuel='Diesel', body='Double Cab',
       colour='White', kw=132, seats=5, l100=8.5, co2=224, zero=11.3, doors=4,
       price=429950, badge='', featured=True, promoted=True,
       history='Full service history', cond='Very Good',
       desc="A 2020 Volkswagen Amarok 2.0 BiTDI Double Cab Highline 4Motion automatic in "
            "white, showing 116 000 km, with a canopy fitted. 132 kW and permanent four "
            "wheel drive through the eight speed automatic. The Amarok remains the double "
            "cab that drives most like a car, with the widest load bin in the class and "
            "enough torque to tow properly. Highline specification, so it has the equipment.",
       features=['4Motion permanent all wheel drive','Eight speed automatic','Canopy fitted',
                 'Leather upholstery','Reverse camera','Park distance control',
                 'Dual zone climate control','Cruise control','Alloy wheels','Bluetooth',
                 'Tow bar','Side steps']),

  # ---- listed stock still to be photographed -----------------------------
  dict(code='0013', photos=0,
       make='Volkswagen', model='T-Cross', variant='1.0TSI 85kW Highline R-Line', year=2023,
       km=57000, trans='Automatic', fuel='Petrol', body='SUV',
       colour='', kw=85, seats=5, l100=5.3, co2=126, zero=10.2, doors=5,
       price=339950, badge='Great Price', featured=False, promoted=False,
       history='Full service history', cond='Excellent',
       desc="A 2023 Volkswagen T-Cross 1.0TSI Highline with the R-Line package, automatic, "
            "showing 57 000 km. The 85 kW version is the one to have: the same frugal "
            "1.0 TSI but with enough in reserve for the open road, and the R-Line trim adds "
            "the sportier bumpers and wheels. Low mileage for the year.",
       features=['Highline specification','R-Line package','Automatic transmission',
                 'Touchscreen infotainment','Digital instrument cluster','Alloy wheels',
                 'Park distance control','Cruise control','Air conditioning',
                 'Sliding rear bench']),

  dict(code='0014', photos=0,
       make='Hyundai', model='H-100', variant='Bakkie 2.6D Forward Control', year=2020,
       km=126000, trans='Manual', fuel='Diesel', body='Single Cab',
       colour='', kw=None, seats=3, l100=None, co2=None, zero=None, doors=2,
       price=219950, badge='Fair Price', featured=False, promoted=False,
       history='Partial service history', cond='Good',
       desc="A 2020 Hyundai H-100 2.6 diesel dropside, showing 126 000 km. The forward "
            "control cab puts the whole wheelbase behind you, which is why this body carries "
            "more than a conventional bakkie of the same length. A genuine one tonne "
            "workhorse for a business that needs to move material rather than impress "
            "anybody.",
       features=['One tonne payload','Dropside body','Diesel engine','Power steering',
                 'Air conditioning','Radio','Tow bar']),

  dict(code='0015', photos=0,
       make='Suzuki', model='Ertiga', variant='1.5 GA', year=2026,
       km=150, trans='Manual', fuel='Petrol', body='MPV',
       colour='', kw=None, seats=7, l100=None, co2=None, zero=None, doors=5,
       price=369950, badge='Fair Price', featured=False, promoted=False,
       history='Full service history', cond='Excellent',
       desc="A 2026 Suzuki Ertiga 1.5 GA with 150 km on it, so effectively a new vehicle. "
            "Seven seats, a 1.5 petrol that will not frighten you at the pumps, and running "
            "costs low enough that this is the default choice for e-hailing operators and "
            "large families alike.",
       features=['Seven seats','Near new demonstration unit','Air conditioning',
                 'Electric front windows','Central locking','Radio with Bluetooth',
                 'Dual airbags','ABS with EBD','ISOFIX child seat anchors']),

  dict(code='0016', photos=0,
       make='Toyota', model='Corolla Cross', variant='1.8 Xi', year=2025,
       km=15, trans='Automatic', fuel='Petrol', body='SUV',
       colour='', kw=None, seats=5, l100=None, co2=None, zero=None, doors=5,
       price=399950, badge='High Price', featured=False, promoted=False,
       history='Full service history', cond='Excellent',
       desc="A 2025 Toyota Corolla Cross 1.8 Xi with 15 km on the odometer, which makes it a "
            "new car in all but the paperwork. The Corolla Cross has become the sensible "
            "family crossover in South Africa for the same reasons the Corolla always was: "
            "it is easy to own, cheap to run and holds its money.",
       features=['Automatic transmission','Touchscreen infotainment','Reverse camera',
                 'Cruise control','Air conditioning','Alloy wheels','Electric windows',
                 'ISOFIX child seat anchors','Multiple airbags']),

  dict(code='0017', photos=0,
       make='Audi', model='A3', variant='Sedan 30TFSI Auto', year=2020,
       km=99000, trans='Automatic', fuel='Petrol', body='Sedan',
       colour='', kw=None, seats=5, l100=None, co2=None, zero=None, doors=4,
       price=299950, badge='Fair Price', featured=False, promoted=False,
       history='Full service history', cond='Very Good',
       desc="A 2020 Audi A3 Sedan 30TFSI automatic, showing 99 000 km. The sedan body gives "
            "you a proper boot without losing the A3's proportions, and the 30TFSI is the "
            "economical one to run day to day. Well built inside, as an A3 always is.",
       features=['Automatic transmission','Alloy wheels','Dual zone climate control',
                 'Cruise control','Park distance control','Bluetooth',
                 'Multifunction steering wheel','LED headlights']),
]


# ---------------------------------------------------------------------------
def slug(v):
    parts = [str(v['year']), v['make'], v['model'], v['variant'], v['code']]
    s = ' '.join(p for p in parts if p).lower()
    out = []
    for ch in s:
        out.append(ch if ch.isalnum() else '-')
    s = ''.join(out)
    while '--' in s:
        s = s.replace('--', '-')
    return s.strip('-')


def q(s):
    """Single-quoted SQL literal."""
    return "'" + str(s).replace("'", "''") + "'"


def jss(s):
    """Single-quoted JS literal."""
    return "'" + str(s).replace('\\', '\\\\').replace("'", "\\'") + "'"


def sql_rows():
    out = []
    for i, v in enumerate(V, start=1):
        imgs = ("to_jsonb(array[" + ",".join(
            "img||'/%s/%02d.jpg'" % (v['code'], n) for n in range(1, v['photos'] + 1)
        ) + "])") if v['photos'] else "'[]'::jsonb"
        feats = "'" + str(v['features']).replace("'", '"') + "'::jsonb"
        n = lambda x: 'null' if x is None else str(x)
        row = (
            "('v_{code}',{code_q},{make},{model},{variant},{year},{km},{trans},{fuel},{body},\n"
            " {colour},{kw},{seats},{l100},{co2},{zero},{doors},\n"
            " {price},{badge},0,\n"
            " {desc},\n"
            " {feats},\n"
            " {imgs},\n"
            " {hist},{cond},'available',{feat},{promo},false,false,false,{slug},{sort})"
        ).format(
            code=v['code'], code_q=q(v['code']),
            make=q(v['make']), model=q(v['model']), variant=q(v['variant']),
            year=n(v['year']), km=v['km'], trans=q(v['trans']), fuel=q(v['fuel']),
            body=q(v['body']), colour=q(v['colour']), kw=n(v['kw']), seats=n(v['seats']),
            l100=n(v['l100']), co2=n(v['co2']), zero=n(v['zero']), doors=n(v['doors']),
            price=v['price'], badge=q(v['badge']), desc=q(v['desc']),
            feats=feats, imgs=imgs, hist=q(v['history']), cond=q(v['cond']),
            feat=str(v['featured']).lower(), promo=str(v['promoted']).lower(),
            slug=q(slug(v)), sort=i)
        out.append("-- %s  %s %s\n%s" % (v['code'], v['make'], v['model'], row))
    return ",\n\n".join(out)


def js_rows():
    out = []
    # newest first in created order, so "latest arrivals" is stable
    from datetime import date, timedelta
    base = date(2026, 8, 24)
    for i, v in enumerate(V, start=1):
        n = lambda x: 'null' if x is None else str(x)
        imgs = "pics('%s',%d)" % (v['code'], v['photos']) if v['photos'] else "[]"
        feats = "[" + ",".join(jss(f) for f in v['features']) + "]"
        created = (base - timedelta(days=i)).isoformat() + "T09:00:00Z"
        out.append(
            "    {{ id:'v_{code}', stock:{code_q}, make:{make}, model:{model}, variant:{variant},\n"
            "      year:{year}, mileage:{km}, transmission:{trans}, fuel:{fuel}, body:{body},\n"
            "      colour:{colour}, engine:'', power_kw:{kw}, seats:{seats}, fuel_use:{l100},\n"
            "      co2:{co2}, zero_to_hundred:{zero}, doors:{doors}, price:{price},\n"
            "      price_badge:{badge}, installment:0, finance_eligible:true,\n"
            "      description:{desc},\n"
            "      features:{feats},\n"
            "      images:{imgs}, video:'', service_history:{hist}, condition:{cond},\n"
            "      status:'available', featured:{feat}, promoted:{promo}, reserved:false,\n"
            "      sold:false, slug:{slug}, meta_title:'', meta_description:'', views:0,\n"
            "      sort_order:{sort}, created_at:'{created}' }}"
            .format(code=v['code'], code_q=jss(v['code']), make=jss(v['make']),
                    model=jss(v['model']), variant=jss(v['variant']), year=n(v['year']),
                    km=v['km'], trans=jss(v['trans']), fuel=jss(v['fuel']), body=jss(v['body']),
                    colour=jss(v['colour']), kw=n(v['kw']), seats=n(v['seats']),
                    l100=n(v['l100']), co2=n(v['co2']), zero=n(v['zero']), doors=n(v['doors']),
                    price=v['price'], badge=jss(v['badge']), desc=jss(v['desc']),
                    feats=feats, imgs=imgs, hist=jss(v['history']), cond=jss(v['cond']),
                    feat=str(v['featured']).lower(), promo=str(v['promoted']).lower(),
                    slug=jss(slug(v)), sort=i, created=created))
    return ",\n\n".join(out)


def splice(path, start, end, body):
    import io
    s = io.open(path, encoding='utf-8').read()
    a = s.index(start) + len(start)
    b = s.index(end)
    io.open(path, 'w', encoding='utf-8').write(s[:a] + "\n" + body + "\n" + s[b:])


if __name__ == '__main__':
    splice('database/02-seed.sql',
           '-- >>> GENERATED BY database/stock.py, DO NOT EDIT BY HAND >>>',
           '-- <<< END GENERATED <<<', sql_rows())
    splice('js/fallback.js',
           '/* >>> GENERATED BY database/stock.py, DO NOT EDIT BY HAND >>> */',
           '/* <<< END GENERATED <<< */', js_rows())

    live = [v for v in V if v['photos']]
    print("%d vehicles written to both files" % len(V))
    print("  %d with photographs (%d images), %d awaiting photography"
          % (len(live), sum(v['photos'] for v in live), len(V) - len(live)))
    print("  %d featured, %d promoted" % (sum(1 for v in V if v['featured']),
                                          sum(1 for v in V if v['promoted'])))
