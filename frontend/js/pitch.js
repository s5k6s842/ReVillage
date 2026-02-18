document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    window.scrollToSection = function (id) {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        // Close mobile menu if open
        const menu = document.getElementById('mobile-menu');
        if (menu && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    };

    window.toggleMobileMenu = function () {
        const menu = document.getElementById('mobile-menu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    };

    // --- Pricing Calculator Logic ---
    let currentMemberType = 'general'; // general or member

    window.setMemberType = function (type) {
        currentMemberType = type;
        // Update UI buttons
        const btnGeneral = document.getElementById('btn-general');
        const btnMember = document.getElementById('btn-member');
        const savingsDiv = document.getElementById('member-savings');

        if (type === 'general') {
            btnGeneral.classList.add('active');
            btnMember.classList.remove('active');
            if (savingsDiv) savingsDiv.style.display = 'none';
        } else {
            btnMember.classList.add('active');
            btnGeneral.classList.remove('active');
            if (savingsDiv) savingsDiv.style.display = 'block';
        }
        calculatePrice();
    };

    window.calculatePrice = function () {
        const guestEl = document.getElementById('guest-count');
        const nightEl = document.getElementById('night-count');

        if (!guestEl || !nightEl) return;

        const guests = parseInt(guestEl.value);
        let nights = parseInt(nightEl.value);
        const nightWarning = document.getElementById('night-warning');

        // Enforce min 2 nights logic visually
        if (nights < 2) {
            if (nightWarning) nightWarning.style.display = 'block';
        } else {
            if (nightWarning) nightWarning.style.display = 'none';
        }

        // Pricing Logic
        let pricePerPersonPerNight = 0;

        if (currentMemberType === 'member') {
            if (nights <= 2) pricePerPersonPerNight = 37500;
            else if (nights <= 7) pricePerPersonPerNight = 28000;
            else pricePerPersonPerNight = 19000;
        } else {
            // General
            if (nights <= 2) pricePerPersonPerNight = 50000;
            else if (nights <= 7) pricePerPersonPerNight = 37500;
            else pricePerPersonPerNight = 25000;
        }

        const total = pricePerPersonPerNight * guests * nights;

        // Display Update
        const totalPriceEl = document.getElementById('total-price');
        const perPersonEl = document.getElementById('price-per-person');

        if (totalPriceEl) totalPriceEl.innerText = '¥' + total.toLocaleString();
        if (perPersonEl) perPersonEl.innerText = '¥' + pricePerPersonPerNight.toLocaleString() + ' / person / night';

        // Calculate comparison
        if (currentMemberType === 'member') {
            let generalRate = 0;
            if (nights <= 2) generalRate = 50000;
            else if (nights <= 7) generalRate = 37500;
            else generalRate = 25000;

            const generalTotal = generalRate * guests * nights;
            const savings = generalTotal - total;
            const savingsAmountEl = document.getElementById('savings-amount');
            if (savingsAmountEl) savingsAmountEl.innerText = savings.toLocaleString();
        }
    };

    // --- Voting Power Calculator Logic ---
    window.updateVotingPower = function () {
        const nftInput = document.getElementById('calc-nft');
        const honorInput = document.getElementById('calc-honor');

        if (!nftInput || !honorInput) return;

        const nftCount = parseInt(nftInput.value) || 0;
        const honorScore = parseInt(honorInput.value) || 1;

        // Update range display
        const honorValEl = document.getElementById('honor-val');
        if (honorValEl) honorValEl.innerText = honorScore;

        // Formula: Voting Power = (NFT * 1) * (1 + log10(Honor))
        const h = Math.max(1, honorScore);
        const power = (nftCount * 1) * (1 + Math.log10(h));

        const votingResultEl = document.getElementById('voting-result');
        if (votingResultEl) votingResultEl.innerText = power.toFixed(2);
    };

    // --- Tech Animation ---
    window.triggerRipple = function (element) {
        const ripple = element.querySelector('.ripple-effect');
        if (ripple) {
            ripple.classList.remove('animate-ripple');
            void ripple.offsetWidth; // trigger reflow
            ripple.classList.add('animate-ripple');

            // Also simulate "success" log
            setTimeout(() => {
                const icon = element.querySelector('.tech-icon-inner');
                if (icon) {
                    const original = icon.innerText;
                    icon.innerText = "✨";
                    setTimeout(() => icon.innerText = original, 1000);
                }
            }, 500);
        }
    };

    // --- Chart.js: Honor Decay ---
    const ctx = document.getElementById('decayChart');
    if (ctx) {
        // Initial calc
        calculatePrice();
        updateVotingPower();

        // Data generation
        const months = Array.from({ length: 13 }, (_, i) => i); // 0 to 12

        const residentData = [100];
        let currentRes = 100;
        for (let i = 1; i <= 12; i++) {
            currentRes = currentRes * 0.7;
            residentData.push(currentRes);
        }

        const memberData = [100];
        for (let i = 1; i <= 12; i++) {
            memberData.push(100);
        }

        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: months.map(m => `Month ${m}`),
                datasets: [
                    {
                        label: 'Resident (Inactive)',
                        data: residentData,
                        borderColor: '#C69C6D',
                        backgroundColor: 'rgba(198, 156, 109, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Member (No Visit)',
                        data: memberData,
                        borderColor: '#2F4538', // Mapped to accent-green
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: "'Shippori Mincho', serif"
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': ' + Math.round(context.raw) + ' Honor';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 110,
                        title: {
                            display: true,
                            text: 'Honor Score'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
});
