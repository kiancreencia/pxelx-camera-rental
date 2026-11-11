import type { BookingStatus } from "./types";

export const statusLabel: Record<BookingStatus, string> = {
  pending: "Waiting for our confirmation",
  confirmed: "Confirmed",
  picked_up: "Out with you",
  returned: "Returned",
  cancelled: "Cancelled",
};

export const statusNote: Record<BookingStatus, string> = {
  pending: "We're checking your booking. We'll message you the payment steps to lock your dates.",
  confirmed: "Your dates are locked. We'll contact you about pickup or delivery.",
  picked_up: "Enjoy the shoot. Please return everything by the end of your last rental day.",
  returned: "Thanks for renting with us. We'd love to see what you shot.",
  cancelled: "This booking was cancelled. The gear is free for others to book.",
};

export const statusTone: Record<BookingStatus, string> = {
  pending: "bg-warn-soft text-warn",
  confirmed: "bg-ok-soft text-ok",
  picked_up: "bg-ok-soft text-ok",
  returned: "bg-line text-ink-soft",
  cancelled: "bg-line text-muted",
};

export const allStatuses: BookingStatus[] = ["pending", "confirmed", "picked_up", "returned", "cancelled"];
