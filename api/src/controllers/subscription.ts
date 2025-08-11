import Stripe from "stripe";
import { Request, Response } from "express";
import { prisma, stripe } from "../config.js";

export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            res.status(400).json({ message: "Please enter a userId." });
            return;
        }

        // Create Stripe Checkout Session for subscriptions
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.CLIENT_URL}/subscription-success`,
            cancel_url: `${process.env.CLIENT_URL}/subscription-cancel`,
            client_reference_id: userId,
            metadata: {
                userId: userId.toString(),
            },
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create session" });
    }
};

export const cancelSubscription = async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
        // Fetch the Stripe customer ID from your DB using your app's user ID
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: { stripeCustomerId: true },
        });

        if (!user || !user.stripeCustomerId) {
            res.status(404).json({ error: "User or customer ID not found" });
            return;
        }

        // List active subscriptions for this Stripe customer
        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: "active",
            limit: 1,
        });

        if (!subscriptions.data.length) {
            res.status(404).json({ error: "No active subscription found" });
            return;
        }

        const subscriptionId = subscriptions.data[0].id;

        // Cancel the subscription
        await stripe.subscriptions.cancel(subscriptionId);

        // Optional: update your DB to reflect subscription cancellation
        await prisma.user.update({
            where: { id: Number(userId) },
            data: { isSubscribed: false, subscriptionEndDate: null },
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Cancel subscription error:", error);
        res.status(500).json({ error: "Failed to cancel subscription" });
    }
};

export const webhook = async (req: Request, res: Response) => {
    console.log("POST to /subscription/webhook");
    const sig = req.headers["stripe-signature"];

    if (!sig || Array.isArray(sig)) {
        console.error("Missing or invalid Stripe signature header");
        res.sendStatus(400);
        return;
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err?.message);
        res.sendStatus(400);
        return;
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = Number(session?.client_reference_id);

                const now = new Date();
                const endDate = new Date(now);
                endDate.setDate(endDate.getDate() + 30);

                const subscriptionId = session.subscription as
                    | string
                    | undefined;
                const customerId = session.customer as string | undefined;

                if (!userId || !subscriptionId) {
                    console.warn(
                        "Missing client_reference_id or subscription id"
                    );
                    break;
                }

                // Update subscription metadata with your userId
                await stripe.subscriptions.update(subscriptionId, {
                    metadata: {
                        userId: userId.toString(),
                    },
                });

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        isSubscribed: true,
                        subscriptionEndDate: endDate,
                        stripeSubscriptionId: subscriptionId || null,
                        stripeCustomerId: customerId || null,
                    },
                });
                console.log("User signed up for subscription " + userId);
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = Number(subscription?.metadata?.userId);

                if (!userId) {
                    console.warn("No userId in subscription.metadata");
                    break;
                }

                await prisma.user.update({
                    where: { id: userId },
                    data: { isSubscribed: false },
                });
                console.log("User cancelled their subscription " + userId);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (err) {
        console.error(`Error handling ${event.type}:`, err);
        res.sendStatus(500);
        return;
    }

    res.json({ received: true });
};
