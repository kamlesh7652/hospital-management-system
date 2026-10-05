import api from "./axios";

export const createOrder = (billId, amount) => api.post("/payments/create-order", { billId, amount });
export const verifyPayment = (body) => api.post("/payments/verify", body);

const loadScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

export const payOnline = async (bill, { onSuccess, onError }) => {
    if (!(await loadScript())) return onError("Razorpay load nahi hua");
    try {
        const { data } = await createOrder(bill._id);
        const o = data.data;

        const rzp = new window.Razorpay({
            key: o.keyId,
            amount: o.amount,
            currency: o.currency,
            order_id: o.orderId,
            name: "OHMS",
            description: `Bill ${o.billNumber}`,
            handler: async (resp) => {
                try {
                    await verifyPayment(resp);
                    onSuccess();
                } catch (e) {
                    onError(e.response?.data?.message || "Verify fail hua");
                }
            }
        });
        rzp.on("payment.failed", (r) => onError(r.error.description));
        rzp.open();
    } catch (e) {
        onError(e.response?.data?.message || e.message);
    }
};