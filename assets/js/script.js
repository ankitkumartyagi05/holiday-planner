const app = {
    state: {
        step: 'home',
        country: null, destination: null, accommodation: null, transport: null,
        startDate: '', endDate: '', itinerary: [], theme: 'light', lang: 'en', editingDay: null
    },
    data: {
        countries: [
            { code: 'IN', name: 'India', flag: '🇮🇳', currency: '₹', rate: 83 },
            { code: 'US', name: 'USA', flag: '🇺🇸', currency: '$', rate: 1 },
            { code: 'GB', name: 'UK', flag: '🇬🇧', currency: '$', rate: 1 },
            { code: 'FR', name: 'France', flag: '🇫🇷', currency: '$', rate: 1 },
            { code: 'AE', name: 'UAE', flag: '🇦🇪', currency: '$', rate: 1 }
        ],
        destinations: {
            'IN': [{ id: 1, name: 'Goa Beach', type: 'Beach', cost: 3000, img: 'https://picsum.photos/seed/goabeach/400/300' }, { id: 2, name: 'Manali Hills', type: 'Mountains', cost: 4500, img: 'https://picsum.photos/seed/manalihills/400/300' }, { id: 3, name: 'Mumbai City', type: 'City', cost: 5000, img: 'https://picsum.photos/seed/mumbaicity/400/300' }],
            'US': [{ id: 4, name: 'Miami Coast', type: 'Beach', cost: 200, img: 'https://picsum.photos/seed/miamibeach/400/300' }, { id: 5, name: 'Denver Ranges', type: 'Mountains', cost: 180, img: 'https://picsum.photos/seed/denvermtns/400/300' }, { id: 6, name: 'New York', type: 'City', cost: 300, img: 'https://picsum.photos/seed/nycity/400/300' }],
            'GB': [{ id: 7, name: 'Cornwall', type: 'Beach', cost: 120, img: 'https://picsum.photos/seed/cornwallbeach/400/300' }, { id: 8, name: 'Scottish Highlands', type: 'Mountains', cost: 110, img: 'https://picsum.photos/seed/scottishhills/400/300' }, { id: 9, name: 'London', type: 'City', cost: 200, img: 'https://picsum.photos/seed/londoncity/400/300' }],
            'FR': [{ id: 10, name: 'Nice Riviera', type: 'Beach', cost: 140, img: 'https://picsum.photos/seed/nicebeach/400/300' }, { id: 11, name: 'Chamonix', type: 'Mountains', cost: 130, img: 'https://picsum.photos/seed/chamonix/400/300' }, { id: 12, name: 'Paris', type: 'City', cost: 180, img: 'https://picsum.photos/seed/pariscity/400/300' }],
            'AE': [{ id: 13, name: 'JBR Beach', type: 'Beach', cost: 150, img: 'https://picsum.photos/seed/jbrdubai/400/300' }, { id: 14, name: 'Hatta Mountains', type: 'Mountains', cost: 100, img: 'https://picsum.photos/seed/hatta/400/300' }, { id: 15, name: 'Dubai Marina', type: 'City', cost: 220, img: 'https://picsum.photos/seed/dubaimarina/400/300' }]
        },
        hotels: [{ name: 'Backpacker Hostel', mult: 0.5 }, { name: '3-Star Hotel', mult: 1.0 }, { name: '5-Star Resort', mult: 3.0 }],
        transport: [{ name: 'Bus', cost: 10 }, { name: 'Train', cost: 20 }, { name: 'Car Rental', cost: 80 }, { name: 'Flight', cost: 150 }]
    },
    init: function () {
        $('.view-section').hide();
        $('#view-home').show();
        this.renderCountries();
        this.updateMobileNav();

        // Theme
        $('#themeToggle').click(() => {
            this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
            $('html').attr('data-theme', this.state.theme);
            $('#themeToggle').html(this.state.theme === 'light' ? '<i class="bi bi-moon-stars-fill"></i>' : '<i class="bi bi-sun-fill"></i>');
        });

        // Lang
        $('#langSelect').change((e) => {
            this.state.lang = e.target.value;
            if (this.state.lang === 'ar') $('html').attr('dir', 'rtl'); else $('html').attr('dir', 'ltr');
            this.updateMobileNav();
        });
    },
    navTo: function (viewId) {
        if (viewId === 'step-destination' && !this.state.country) return alert('Select Country');
        if (viewId === 'step-stay' && !this.state.destination) return alert('Select Destination');
        if (viewId === 'step-itinerary' && (!this.state.accommodation || !this.state.transport)) return alert('Select Hotel & Transport');
        if (viewId === 'step-review' && this.state.itinerary.length === 0) return alert('Generate Days');

        $('.view-section').removeClass('active').hide();
        $('#view-' + viewId).addClass('active').show();
        this.state.step = viewId;
        window.scrollTo(0, 0);

        // Progress
        const steps = ['home', 'step-country', 'step-destination', 'step-stay', 'step-itinerary', 'step-review', 'step-final'];
        const pct = (steps.indexOf(viewId) / (steps.length - 1)) * 100;
        $('#progressBar').css('width', pct + '%');
        if (viewId === 'home' || viewId === 'step-final') $('.progress-sticky').addClass('d-none');
        else $('.progress-sticky').removeClass('d-none');

        // Renders
        if (viewId === 'step-destination') this.renderDestinations();
        if (viewId === 'step-stay') this.renderStayTransport();
        if (viewId === 'step-review') this.renderReview();
        if (viewId === 'step-final') this.renderFinal();

        this.updateMobileNav();
    },
    renderCountries: function () {
        const html = this.data.countries.map(c => `
            <div class="col-4 col-md-2">
                <div class="card text-center p-2 cursor-pointer shadow-sm h-100 d-flex flex-column justify-content-center" onclick="app.setCountry('${c.code}')">
                    <div class="fs-2">${c.flag}</div>
                    <div class="small fw-bold text-truncate">${c.name}</div>
                </div>
            </div>
        `).join('');
        $('#countryGrid').html(html);
    },
    setCountry: function (code) {
        this.state.country = this.data.countries.find(c => c.code === code);
        this.navTo('step-destination');
    },
    renderDestinations: function () {
        const list = this.data.destinations[this.state.country.code];
        const html = list.map(d => `
            <div class="col-md-4 col-sm-6 dest-card theme-${d.type.toLowerCase()}">
                <div class="card h-100">
                    <img src="${d.img}" class="card-img-top" alt="${d.name}">
                    <div class="card-body">
                        <h5 class="fw-bold">${d.name}</h5> 
                        <span class="badge badge-${d.type.toLowerCase()} fw-bold mb-2">${d.type}</span>
                        <p class="card-text text-muted small">Experience the beauty of ${d.type}.</p>
                        <button class="btn btn-outline-primary w-100" onclick="app.setDest(${d.id})">Select (${this.formatMoney(d.cost)})</button>
                    </div>
                </div>
            </div>
        `).join('');
        $('#destinationGrid').html(html);
    },
    filterDest: function (type) {
        if (type === 'all') { $('.dest-card').fadeIn(); }
        else { $('.dest-card').hide(); $(`.theme-${type.toLowerCase()}`).fadeIn(); }
    },
    setDest: function (id) {
        const list = this.data.destinations[this.state.country.code];
        this.state.destination = list.find(d => d.id === id);
        this.navTo('step-stay');
    },
    renderStayTransport: function () {
        const destCost = this.state.destination.cost;
        $('#accomList').html(this.data.hotels.map((h, i) =>
            `<li class="list-group-item list-group-item-action d-flex justify-content-between cursor-pointer" onclick="app.setHotel(${i}, ${destCost * h.mult})">
                <div><div class="fw-bold">${h.name}</div><small class="text-muted">Comfort Level</small></div> 
                <span class="badge bg-primary">${this.formatMoney(destCost * h.mult)}</span>
            </li>`).join(''));

        $('#transportList').html(this.data.transport.map((t, i) =>
            `<li class="list-group-item list-group-item-action d-flex justify-content-between cursor-pointer" onclick="app.setTrans(${i}, ${t.cost * this.state.country.rate})">
                <div class="fw-bold">${t.name}</div> 
                <span class="badge bg-success">${this.formatMoney(t.cost * this.state.country.rate)}</span>
            </li>`).join(''));
    },
    setHotel: function (idx, cost) { this.state.accommodation = { ...this.data.hotels[idx], cost }; this.updateEst(); },
    setTrans: function (idx, cost) { this.state.transport = { ...this.data.transport[idx], cost }; this.updateEst(); },
    updateEst: function () {
        if (this.state.accommodation && this.state.transport) $('#estCostDisplay').text(this.formatMoney(this.state.accommodation.cost + this.state.transport.cost));
    },
    generateDays: function () {
        const start = $('#startDate').val();
        const end = $('#endDate').val();
        if (!start || !end) return alert('Pick dates');

        const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
        this.state.startDate = start; this.state.endDate = end;
        this.state.itinerary = [];
        for (let i = 0; i < days; i++) {
            let d = new Date(start); d.setDate(d.getDate() + i);
            this.state.itinerary.push({ date: d.toLocaleDateString(), acts: [] });
        }
        this.renderDays();
        $('#itineraryContainer').removeClass('d-none');
    },
    renderDays: function () {
        const html = this.state.itinerary.map((day, i) => `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-header fw-bold">Day ${i + 1} - ${day.date}</div>
                    <div class="card-body" id="acts-${i}">
                        ${day.acts.length ? '' : '<p class="text-muted small text-center">No activities planned</p>'}
                    </div>
                    <div class="card-footer text-center"><button class="btn btn-sm btn-outline-primary w-100" onclick="app.addAct(${i})">+ Add Activity</button></div>
                </div>
            </div>
        `).join('');
        $('#daysWrapper').html(html);
        this.refreshActs();
    },
    refreshActs: function () {
        this.state.itinerary.forEach((day, i) => {
            const html = day.acts.map((a, j) => `
                <div class="d-flex justify-content-between border-bottom py-1 small">
                    <span><b>${a.time}</b> ${a.desc}</span>
                    <span>
                        <span class="text-muted">${this.formatMoney(a.cost)}</span> 
                        <i class="bi bi-trash text-danger cursor-pointer" onclick="app.delAct(${i}, ${j})"></i>
                    </span>
                </div>`).join('');
            $(`#acts-${i}`).html(html || '<p class="text-muted small text-center">No activities planned</p>');
        });
    },
    addAct: function (dayIdx) {
        this.state.editingDay = dayIdx;
        $('#modalTime, #modalDesc, #modalCost').val('');
        new bootstrap.Modal(document.getElementById('activityModal')).show();
    },
    saveActivity: function () {
        const time = $('#modalTime').val();
        const desc = $('#modalDesc').val();
        const cost = parseFloat($('#modalCost').val()) || 0;
        if (!time || !desc) return alert('Fill Time and Description');

        this.state.itinerary[this.state.editingDay].acts.push({ time, desc, cost });
        bootstrap.Modal.getInstance(document.getElementById('activityModal')).hide();
        this.refreshActs();
    },
    delAct: function (d, a) {
        this.state.itinerary[d].acts.splice(a, 1);
        this.refreshActs();
    },
    renderReview: function () {
        const s = this.state;
        const totalDays = s.itinerary.length;
        const stay = s.accommodation.cost * totalDays;
        const trans = s.transport.cost * totalDays;
        let acts = 0; s.itinerary.forEach(d => d.acts.forEach(a => acts += a.cost));
        const tot = stay + trans + acts;

        $('#reviewDetailsTable').html(`
            <tr><td>Country</td><td class="text-end fw-bold">${s.country.flag} ${s.country.name}</td></tr>
            <tr><td>Destination</td><td class="text-end fw-bold">${s.destination.name}</td></tr>
            <tr><td>Hotel</td><td class="text-end">${s.accommodation.name}</td></tr>
            <tr><td>Transport</td><td class="text-end">${s.transport.name}</td></tr>
        `);
        $('#budgetList').html(`
            <li class="list-group-item d-flex justify-content-between"><span>Stay</span> <span>${this.formatMoney(stay)}</span></li>
            <li class="list-group-item d-flex justify-content-between"><span>Transport</span> <span>${this.formatMoney(trans)}</span></li>
            <li class="list-group-item d-flex justify-content-between"><span>Activities</span> <span>${this.formatMoney(acts)}</span></li>
        `);
        $('#totalBudgetDisplay').text(this.formatMoney(tot));
    },
    renderFinal: function () {
        const s = this.state;
        $('#printDestName').text(s.destination.name);
        $('#printCountryName').text(s.country.name);
        $('#printHotel').text(`${s.accommodation.name} (${this.formatMoney(s.accommodation.cost)}/night)`);
        $('#printTransport').text(s.transport.name);
        $('#printDates').text(`${s.startDate} to ${s.endDate}`);
        $('#printTotal').text($('#totalBudgetDisplay').text());
        $('#printCostList').html($('#budgetList').html());
        $('#printItineraryTimeline').html(s.itinerary.map((d, i) =>
            `<div class="mb-3"><strong class="text-primary">Day ${i + 1} - ${d.date}</strong><div class="ms-3 small text-muted">${d.acts.map(a => `<div>${a.time}: ${a.desc} (${this.formatMoney(a.cost)})</div>`).join('')}</div></div>`
        ).join(''));
    },
    updateMobileNav: function () {
        const steps = ['home', 'step-country', 'step-destination', 'step-stay', 'step-itinerary', 'step-review', 'step-final'];
        const idx = steps.indexOf(this.state.step);
        const nextMap = ['Country', 'Destination', 'Stay', 'Itinerary', 'Review', 'Finish', 'Download'];

        $('#mobileBackBtn').toggle(idx > 0).attr('onclick', "app.navTo('" + (idx > 0 ? steps[idx - 1] : 'home') + "')");

        if (idx < steps.length - 1) {
            $('#mobileNextBtn').text('Next: ' + nextMap[idx]).show().attr('onclick', "app.navTo('" + steps[idx + 1] + "')");
        } else {
            $('#mobileNextBtn').text('Download PDF').show().attr('onclick', "window.print()");
        }
    },
    formatMoney: function (amt) {
        return this.state.country.currency + ' ' + Math.round(amt).toLocaleString();
    }
};

$(document).ready(() => app.init());
