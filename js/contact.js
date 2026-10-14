document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const alertBox = document.getElementById("contactAlertBox");
    const submitBtn = document.getElementById("submitContactBtn");
    const successCard = document.getElementById("contactSuccessCard");
    const waFollowup = document.getElementById("contactWaFollowup");
    const btnSendAnother = document.getElementById("btnSendAnother");

    const OWNER_PHONE = "8056639518";

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
        const hp = document.getElementById("_hp_contact");
        if (hp && hp.value) {
            console.warn("Spam bot submission blocked.");
            return;
        }

        const formData = new FormData(form);
        const name = (formData.get("name") || "").trim();
        const phone = (formData.get("phone") || "").trim();
        const email = (formData.get("email") || "").trim();
        const subject = (formData.get("subject") || "").trim();
        const message = (formData.get("message") || "").trim();

        // Validations
        if (!name || name.length < 2) {
            showAlert("Please enter your name.");
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

        if (!subject || subject.length < 3) {
            showAlert("Please enter a subject.");
            document.getElementById("subject")?.focus();
            return;
        }

        if (!message || message.length < 5) {
            showAlert("Please write your message.");
            document.getElementById("message")?.focus();
            return;
        }

        isSubmitting = true;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="btn-spinner"></span>
                <span>Sending Message...</span>
            `;
        }

        const payload = {
            name,
            phone,
            email,
            subject,
            message
        };

        try {
            // 1. Insert into Supabase contacts table
            const sb = getSupabaseClient();
            const res = await sb.from("contacts").insert(payload);
            if (res.error) {
                console.warn("Supabase contacts insert notice:", res.error);
            }
        } catch (dbErr) {
            console.warn("Database notice:", dbErr);
        }

        // 2. Dispatch SMS notification to Owner (8056639518)
        try {
            await fetch("/api/send-order-sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "contact",
                    ...payload
                })
            });
        } catch (smsErr) {
            console.warn("SMS dispatch notice:", smsErr);
        }

        // 3. Show Interactive Success Card with direct WhatsApp link
        if (successCard && waFollowup) {
            const waText = 
`Hello R-Tech Pure Water!
I just sent a message through your website contact form:

Name: ${name}
Phone: ${phone}
Subject: ${subject}
Message: ${message}`;

            waFollowup.href = "https://wa.me/91" + OWNER_PHONE + "?text=" + encodeURIComponent(waText);
            
            form.style.display = "none";
            successCard.style.display = "block";
            successCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
            if (window.showToast) {
                window.showToast("Thank you! Your message has been sent to +91 80566 39518.", "success");
            }
            form.reset();
        }

        isSubmitting = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <span class="btn-text">Send Message</span>
                <i class="ri-send-plane-line btn-icon"></i>
            `;
        }
    });

    if (btnSendAnother) {
        btnSendAnother.addEventListener("click", () => {
            form.reset();
            form.style.display = "block";
            if (successCard) successCard.style.display = "none";
            clearAlert();
        });
    }
});