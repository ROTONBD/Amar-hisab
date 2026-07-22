import { SMSTemplate } from '../types';

export const defaultSmsTemplates: SMSTemplate[] = [
  {
    id: 'tpl-payment-bn',
    title: 'বিল পরিশোধের রসিদ (বাংলা)',
    type: 'payment',
    body: 'প্রিয় {name},\nআপনার {package} প্যাকেজের মাসিক ইন্টারনেট বিল {bill} {currency} সফলভাবে পরিশোধ হয়েছে।\nপরিশোধের তারিখ: {date}\nআমাদের সাথে থাকার জন্য ধন্যবাদ! - [আইএসপি হিসাব খাতা]'
  },
  {
    id: 'tpl-payment-en',
    title: 'Payment Receipt (English)',
    type: 'payment',
    body: 'Dear {name},\nWe have successfully received your monthly payment of {currency}{bill} for package {package}.\nPayment Date: {date}\nThank you for choosing us! - [ISP Hisab Khata]'
  },
  {
    id: 'tpl-due-bn',
    title: 'বকেয়া বিল তাগাদা (বাংলা)',
    type: 'due',
    body: 'প্রিয় {name},\nআপনার {package} ইন্টারনেট প্যাকেজের {bill} {currency} বিল এখনো বকেয়া রয়েছে। অনুগ্রহ করে দ্রুত বিলটি পরিশোধ করুন।\nযোগাযোগ: [অফিস নম্বর]\nধন্যবাদ! - [আইএসপি হিসাব খাতা]'
  },
  {
    id: 'tpl-due-en',
    title: 'Payment Reminder (English)',
    type: 'due',
    body: 'Dear {name},\nThis is a friendly reminder that your monthly bill of {currency}{bill} for package {package} is currently due. Please clear the payment as soon as possible.\nContact: [Office Number]\nThank you! - [ISP Hisab Khata]'
  },
  {
    id: 'tpl-welcome-bn',
    title: 'নতুন সংযোগ শুভেচ্ছা (বাংলা)',
    type: 'welcome',
    body: 'প্রিয় {name},\nআইএসপি নেটওয়ার্কে আপনাকে স্বাগতম! আপনার {package} ইন্টারনেট প্যাকেজের সংযোগটি সফলভাবে সক্রিয় করা হয়েছে। আপনার মাসিক বিলের পরিমাণ {bill} {currency}।\nধন্যবাদ!'
  },
  {
    id: 'tpl-welcome-en',
    title: 'New Welcome (English)',
    type: 'welcome',
    body: 'Dear {name},\nWelcome to our network! Your connection for package {package} has been successfully activated. Your monthly bill is {currency}{bill}.\nThank you!'
  }
];
