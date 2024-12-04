'use client';
import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import { User, Mail, MessageCircle, CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/Navbar';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const serviceId = process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_ID!;
    const templateId = process.env.NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID!;
    const userId = process.env.NEXT_PUBLIC_EMAIL_JS_USER_ID!;

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <Navbar />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-[650px] border-indigo-100 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="border-b border-indigo-50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Contact Us
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Have questions or feedback? We'd love to hear from you!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4 text-indigo-600" />
                  Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-10 border-indigo-100 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4 text-indigo-600" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-10 border-indigo-100 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Enter your email (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <MessageCircle className="h-4 w-4 text-indigo-600" />
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="min-h-[150px] border-indigo-100 focus:ring-2 focus:ring-indigo-500/20 resize-y"
                  placeholder="Type your message here..."
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200/50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          {status && (
            <CardFooter className="border-t border-indigo-50 bg-gradient-to-r from-indigo-50/30 to-purple-50/30">
              <Alert variant={status.includes('sent') ? 'default' : 'destructive'} className="w-full">
                <AlertDescription className="flex items-center justify-center gap-2 text-sm font-medium">
                  {status.includes('sent') ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  {status}
                </AlertDescription>
              </Alert>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;