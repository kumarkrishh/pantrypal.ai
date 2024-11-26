'use client';
import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import { User, Mail, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

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
    const serviceId = 'your_service_id';  // Replace with EmailJS service ID
    const templateId = 'your_template_id';  // Replace with EmailJS template ID
    const userId = 'your_user_id';  // Replace with EmailJS user ID

    const templateParams = {
      name: formData.name,
      email: formData.email,
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
    <div style={contactStyles.container}>
      <Card style={contactStyles.card}>
        <CardHeader>
          <CardTitle style={contactStyles.heading}>Contact Us</CardTitle>
          <CardDescription style={contactStyles.description}>If you have any questions, feedback, or bug reports, feel free to reach out to the developers of Pantry Pal!</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} style={contactStyles.form}>
            <div style={contactStyles.inputGroup}>
              <label htmlFor="name" style={contactStyles.label}>
                <User size={20} style={contactStyles.icon} /> Name:
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={contactStyles.input}
                required
              />
            </div>

            <div style={contactStyles.inputGroup}>
              <label htmlFor="email" style={contactStyles.label}>
                <Mail size={20} style={contactStyles.icon} /> Email (Optional):
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={contactStyles.input}
              />
            </div>

            <div style={contactStyles.inputGroup}>
              <label htmlFor="message" style={contactStyles.label}>
                <MessageCircle size={20} style={contactStyles.icon} /> Message:
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                style={contactStyles.textarea}
                required
              />
            </div>

            <Button type="submit" style={contactStyles.contactButton}>
              Send Message
            </Button>
          </form>

          {status && (
            <div style={contactStyles.statusMessage}>
              {status.includes('sent') ? (
                <CheckCircle size={20} style={{ color: '#28a745', marginRight: '8px' }} />
              ) : (
                <XCircle size={20} style={{ color: '#dc3545', marginRight: '8px' }} />
              )}
              {status}
            </div>
          )}
        </CardContent>
      </Card>
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
