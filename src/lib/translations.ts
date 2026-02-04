export const translations = {
  en: { 
    title: "Book Space", 
    name: "Name", 
    email: "Email", 
    phone: "Phone Number", 
    date: "Select Date", 
    submit: "Reserve Now", 
    dir: "ltr" 
  },
  es: { 
    title: "Reservar Espacio", 
    name: "Nombre", 
    email: "Correo", 
    phone: "Teléfono", 
    date: "Fecha", 
    submit: "Reservar ahora", 
    dir: "ltr" 
  },
  fr: { 
    title: "Réserver un Espace", 
    name: "Nom", 
    email: "E-mail", 
    phone: "Téléphone", 
    date: "Date", 
    submit: "Réserver", 
    dir: "ltr" 
  },
  zh: { 
    title: "预订场地", 
    name: "姓名", 
    email: "电子邮件", 
    phone: "电话号码", 
    date: "日期", 
    submit: "提交预订", 
    dir: "ltr" 
  },
  ar: { 
    title: "حجز مكان", 
    name: "الاسم", 
    email: "البريد الإلكتروني", 
    phone: "رقم الهاتف", 
    date: "التاريخ", 
    submit: "إرسال الطلب", 
    dir: "rtl" 
  },
  de: { 
    title: "Raum buchen", 
    name: "Name", 
    email: "E-Mail", 
    phone: "Telefonnummer", 
    date: "Datum", 
    submit: "Buchen", 
    dir: "ltr" 
  },
  ru: { 
    title: "Забронировать", 
    name: "Имя", 
    email: "Email", 
    phone: "Номер телефона", 
    date: "Дата", 
    submit: "Забронировать", 
    dir: "ltr" 
  },
};

export type Locale = keyof typeof translations;