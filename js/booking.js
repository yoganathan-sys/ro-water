document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("bookingForm");
    if (!form) return;

    const alertBox = document.getElementById("bookingAlertBox");
    const submitBtn = document.getElementById("submitBookingBtn");
    const dateInput = document.getElementById("date");
    const serviceSelect = document.getElementById("service");

    // 1. Set minimum selectable date to today
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        if (!dateInput.value) {
            dateInput.value = today;
        }
    }

    // 2. Auto-select service if provided in URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const paramService = urlParams.get('service');
    if (paramService && serviceSelect) {
        for (let i = 0; i < serviceSelect.options.length; i++) {
            if (serviceSelect.options[i].value.toLowerCase() === paramService.toLowerCase()) {
                serviceSelect.selectedIndex = i;
                break;
            }
        }
    }

    function showAlert(msg, isError = true) {
        if (!alertBox) {
            if (window.showToast) window.showToast(msg, isError ? 'error' : 'success');
            return;
        }
        alertBox.className = `form-alert-banner ${isError ? 'alert-error' : 'alert-success'}`;
        alertBox.innerHTML = `
            <i class="${isError ? 'ri-error-warning-fill' : 'ri-checkbox-circle-fill'}"></i>
            <div>${escapeHtml(msg)}</div>
        `;
        alertBox.style.display = "flex";
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function clearAlert() {
        if (alertBox) alertBox.style.display = "none";
    }

    let isSubmitting = false;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearAlert();

        if (isSubmitting) return;

        // Anti-spam Honeypot Check
        const hp = document.getElementById("_hp_check");
        if (hp && hp.value) {
            console.warn("Spam bot submission blocked.");
            return;
        }

        const formData = new FormData(form);
        const name = (formData.get("name") || "").trim();
        const phone = (formData.get("phone") || "").trim();
        const email = (formData.get("email") || "").trim();
        const service = (formData.get("service") || "").trim();
        const bookingDate = (formData.get("booking_date") || "").trim();
        const address = (formData.get("address") || "").trim();
        const message = (formData.get("message") || "").trim();

        // Client-side validations
        if (!name || name.length < 2) {
            showAlert("Please enter your full name.");
            document.getElementById("name")?.focus();
            return;
        }

        const cleanDigits = phone.replace(/\D/g, "");
        if (cleanDigits.length < 10) {
            showAlert("Please enter a valid 10-digit mobile number.");
            document.getElementById("phone")?.focus();
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert("Please enter a valid email address.");
            document.getElementById("email")?.focus();
            return;
        }

        if (!service) {
            showAlert("Please select a service type.");
            document.getElementById("service")?.focus();
            return;
        }

        if (!bookingDate) {
            showAlert("Please select your preferred service date.");
            document.getElementById("date")?.focus();
            return;
        }

        if (!address || address.length < 5) {
            showAlert("Please provide your service address in detail.");
            document.getElementById("address")?.focus();
            return;
        }

        // Set loading state
        isSubmitting = true;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="btn-spinner"></span>
                <span>Scheduling Your Booking...</span>
            `;
        }

        // Generate Booking Reference Number
        const randomRef = "RTW-" + Math.floor(100000 + Math.random() * 900000);

        const bookingPayload = {
            name,
            phone,
            email,
            service,
            booking_date: bookingDate,
            address,
            message
        };

        let supabaseSuccess = false;
        let insertedId = null;

        try {
            const sb = getSupabaseClient();

            // 1. Insert into water_bookings
            const bookingResult = await sb.from("water_bookings").insert(bookingPayload).select("id");
            if (!bookingResult.error) {
                supabaseSuccess = true;
                if (bookingResult.data && bookingResult.data[0]) {
                    insertedId = bookingResult.data[0].id;
                }
            } else {
                console.warn("Supabase booking insert notice:", bookingResult.error);
            }

            // 2. Insert into customers table
            try {
                await sb.from("customers").insert({ name, email, phone });
            } catch (custErr) {
                console.warn("Customer sync notice:", custErr);
            }

        } catch (dbErr) {
            console.warn("Database connection notice:", dbErr);
            // Non-fatal: we still proceed to save session and trigger notification
        }

        // 3. Trigger SMS notification to Owner (8056639518)
        try {
            await fetch("/api/send-order-sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "booking",
                    id: insertedId || randomRef,
                    ...bookingPayload
                })
            });
        } catch (smsErr) {
            console.warn("SMS dispatch notice:", smsErr);
        }

        // 4. Save booking details for confirmation page
        const savedBooking = {
            ref: insertedId ? `#RTW-${insertedId}` : `#${randomRef}`,
            ...bookingPayload,
            createdAt: new Date().toISOString()
        };

        try {
            sessionStorage.setItem("latest_booking", JSON.stringify(savedBooking));
        } catch (_) {}

        // 5. Open the beautiful confirmation page
        form.reset();
        window.location.href = "booking-confirmation.html";
    });
});