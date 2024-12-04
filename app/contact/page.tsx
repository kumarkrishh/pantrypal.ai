'use client';
import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import { User, Mail, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import Navbar from '@/components/Navbar';

const ContactPage = () => {
  const email = 'pantrypalproject@gmail.com';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // EmailJS service and template ID
    const serviceId = process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_ID!; // Replace with EmailJS service ID
    const templateId = process.env.NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID!;  // Replace with EmailJS template ID
    const userId = process.env.NEXT_PUBLIC_EMAIL_JS_USER_ID!;  // Replace with EmailJS user ID

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
    };

    try {
      setStatus('Sending your message...');

     
      await emailjs.send(serviceId, templateId, templateParams, userId);

      setStatus('Your message has been sent!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      setStatus('Failed to send the message. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

    
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex flex-col items-center justify-center p-4">
       <Navbar />
      <Card className="w-full max-w-[650px] bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Contact Us
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            If you have any questions, feedback, or bug reports, feel free to reach out to the developers of Pantry Pal!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="flex items-center gap-2 text-lg font-medium text-gray-700">
                <User className="w-5 h-5 text-indigo-600" /> Name:
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="p-3 text-lg rounded-lg"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="flex items-center gap-2 text-lg font-medium text-gray-700">
                <Mail className="w-5 h-5 text-indigo-600" /> Email (Optional):
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="p-3 text-lg rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="flex items-center gap-2 text-lg font-medium text-gray-700">
                <MessageCircle className="w-5 h-5 text-indigo-600" /> Message:
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="p-3 text-lg rounded-lg border border-gray-200 focus:border-indigo-600 outline-none min-h-[150px] resize-y"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 text-lg rounded-lg"
            >
              Send Message
            </Button>
          </form>

          {status && (
            <div className="mt-4 flex items-center justify-center text-lg font-semibold">
              {status.includes('sent') ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
              )}
              {status}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

const contactStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center' as 'center',
    justifyContent: 'center' as 'center',
    height: '100vh',
    textAlign: 'center' as 'center',
    background: 'white',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    backgroundColor: 'white', 
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '650px',
  },
  heading: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #5B68EE, #AB4DCA)',  // Purple gradient for title
    WebkitBackgroundClip: 'text',
    color: 'transparent', 
    marginBottom: '16px',
  },
  description: {
    fontSize: '1.2rem',
    marginBottom: '20px',
    color: '#555',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '1.5rem',
    width: '100%',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'flex-start' as 'flex-start',
    gap: '0.5rem',
  },
  label: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1.1rem',
    borderRadius: '10px',
    border: '1px solid #ccc',
    outline: 'none',
    color: '#333', 
    backgroundColor: 'white',  
    '&:focus': {
      borderColor: '#9B4DCA',
    },
  },
  textarea: {
    padding: '0.75rem',
    fontSize: '1.1rem',
    borderRadius: '10px',
    border: '1px solid #ccc',
    outline: 'none',
    color: '#333',
    backgroundColor: 'white',
    '&:focus': {
      borderColor: '#9B4DCA',
    },
    width: '100%', 
    maxWidth: '100%',  
    height: '150px',
    maxHeight: '300px',  
    resize: 'both' as 'both', 
  },  
  contactButton: {
    backgroundColor: '#9B4DCA', 
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    fontSize: '1.2rem',
    borderRadius: '10px',
    textAlign: 'center' as 'center',
    display: 'inline-block',
    marginTop: '20px',
    transition: 'background-color 0.3s ease-in-out',
    '&:hover': {
      backgroundColor: '#7B68EE', 
    },
  },
  statusMessage: {
    marginTop: '20px',
    fontSize: '1.2rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9B4DCA', 
  },
  icon: {
    color: '#9B4DCA',
  },
};

export default ContactPage;
