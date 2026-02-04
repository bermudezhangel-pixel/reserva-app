export const translations = {
  en: { title: "Book a Space", name: "Name", email: "Email", date: "Date", submit: "Request", dir: "ltr" },
  es: { title: "Reservar Espacio", name: "Nombre", email: "Correo", date: "Fecha", submit: "Reservar", dir: "ltr" },
  fr: { title: "Réserver un Espace", name: "Nom", email: "E-mail", date: "Date", submit: "Réserver", dir: "ltr" },
  zh: { title: "预订场地", name: "姓名", email: "电子邮件", date: "日期", submit: "提交预订", dir: "ltr" },
  ar: { title: "حجز مكان", name: "الاسم", email: "البريد الإلكتروني", date: "التاريخ", submit: "إرسال الطلب", dir: "rtl" },
  de: { title: "Raum buchen", name: "Name", email: "E-Mail", date: "Datum", submit: "Buchen", dir: "ltr" },
  ru: { title: "Забронировать", name: "Имя", email: "Email", date: "Дата", submit: "Забронировать", dir: "ltr" },
};

export type Locale = keyof typeof translations;