'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getBrandingAction, updateBrandingAction, uploadLogoAction } from '@/actions/branding-actions';
import { Upload, Save, Eye, Palette, Building2, Mail, Share2, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function BrandingSettingsPage() {
  const [branding, setBranding] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    logoUrl: '',
    logoDarkUrl: '',
    primaryColor: '#00ff00',
    secondaryColor: '#000000',
    accentColor: '#00ff00',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    companyName: 'Botmakers',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    supportEmail: 'support@botmakers.com',
    twitterUrl: '',
    linkedinUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    websiteUrl: 'https://botmakers.com',
    emailFromName: 'Botmakers',
    emailFooterText: '',
    showLogoInEmails: true,
    showSocialLinks: true,
  });

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      setIsLoading(true);
      const result = await getBrandingAction();
      if (result.success && result.branding) {
        setBranding(result.branding);
        setForm({
          logoUrl: result.branding.logoUrl || '',
          logoDarkUrl: result.branding.logoDarkUrl || '',
          primaryColor: result.branding.primaryColor || '#00ff00',
          secondaryColor: result.branding.secondaryColor || '#000000',
          accentColor: result.branding.accentColor || '#00ff00',
          textColor: result.branding.textColor || '#000000',
          backgroundColor: result.branding.backgroundColor || '#ffffff',
          companyName: result.branding.companyName || 'Botmakers',
          companyAddress: result.branding.companyAddress || '',
          companyPhone: result.branding.companyPhone || '',
          companyEmail: result.branding.companyEmail || '',
          supportEmail: result.branding.supportEmail || 'support@botmakers.com',
          twitterUrl: result.branding.twitterUrl || '',
          linkedinUrl: result.branding.linkedinUrl || '',
          facebookUrl: result.branding.facebookUrl || '',
          instagramUrl: result.branding.instagramUrl || '',
          websiteUrl: result.branding.websiteUrl || 'https://botmakers.com',
          emailFromName: result.branding.emailFromName || 'Botmakers',
          emailFooterText: result.branding.emailFooterText || '',
          showLogoInEmails: result.branding.showLogoInEmails !== false,
          showSocialLinks: result.branding.showSocialLinks !== false,
        });
        if (result.branding.logoUrl) {
          setLogoPreview(result.branding.logoUrl);
        }
      }
    } catch (error) {
      toast.error('Failed to load branding settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Auto-upload immediately
      toast.info('Uploading logo...');
      const formData = new FormData();
      formData.append('logo', file);
      
      try {
        const result = await uploadLogoAction(formData);
        console.log('Upload result:', result);
        
        if (result.success && result.url) {
          console.log('Logo URL:', result.url);
          
          // Update form with new logo URL
          const updatedForm = { ...form, logoUrl: result.url };
          setForm(updatedForm);
          setLogoPreview(result.url);
          
          // Auto-save after successful upload
          const saveResult = await updateBrandingAction(updatedForm);
          console.log('Save result:', saveResult);
          
          if (saveResult.success) {
            toast.success('Logo uploaded and saved successfully!');
            await loadBranding();
          } else {
            toast.error('Logo uploaded but failed to save.');
          }
        } else {
          toast.error(result.error || 'Failed to upload logo');
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error('Failed to upload logo: ' + error.message);
      }
    }
  };


  const handleSave = async () => {
    try {
      setIsSaving(true);
      const result = await updateBrandingAction(form);
      if (result.success) {
        toast.success('Branding settings saved!');
        loadBranding();
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReseedTemplates = async () => {
    try {
      toast.info('Updating email templates...');
      const response = await fetch('/api/seed-templates', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        toast.success('Email templates updated! Your branding will now appear in all emails.');
      } else {
        toast.error(result.message || 'Failed to update templates');
      }
    } catch (error: any) {
      toast.error('Failed to update templates: ' + error.message);
    }
  };

  const generatePreviewEmail = () => {
    // Debug: Check what logo URL we have
    console.log('Preview email - form.logoUrl:', form.logoUrl);
    console.log('Preview email - logoPreview:', logoPreview);
    
    // Use logoPreview (latest state) if available, otherwise fall back to form.logoUrl
    const logoUrl = logoPreview || form.logoUrl;
    const hasLogo = logoUrl && logoUrl.trim() !== '';
    
    console.log('Using logo URL for preview:', logoUrl);
    console.log('Has logo?', hasLogo);
    
    const logoHtml = hasLogo 
      ? `<img src="${logoUrl}" alt="${form.companyName}" style="height: 60px;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;font-size: 36px; font-weight: 700; color: ${form.secondaryColor};&quot;>${form.companyName}</div>'" />`
      : `<div style="font-size: 36px; font-weight: 700; color: ${form.secondaryColor};">${form.companyName}</div>`;
    
    const footerLogoHtml = hasLogo
      ? `<img src="${logoUrl}" alt="${form.companyName}" style="height: 30px; margin-bottom: 15px; opacity: 0.6;" onerror="this.style.display='none'" />`
      : `<div style="font-size: 18px; font-weight: 600; color: #6b7280; margin-bottom: 15px;">${form.companyName}</div>`;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Preview</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Logo Header -->
          <tr>
            <td style="background: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 3px solid ${form.primaryColor};">
              ${logoHtml}
            </td>
          </tr>
          
          <!-- Colored Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, ${form.primaryColor} 0%, ${form.secondaryColor} 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Your Project!</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: ${form.textColor}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi <strong>John Doe</strong>,</p>
              
              <p style="color: ${form.textColor}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">We're excited to work with you on <strong style="color: ${form.primaryColor};">Your New Project</strong>! This is a preview of how your branded emails will look.</p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 35px 0;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; background: ${form.primaryColor}; color: ${form.secondaryColor}; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">Get Started →</a>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${form.backgroundColor}; border-left: 4px solid ${form.primaryColor}; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <tr>
                  <td>
                    <p style="color: ${form.textColor}; font-size: 14px; line-height: 1.5; margin: 0;">This is an info box with your accent color. It looks great for highlighting important information!</p>
                  </td>
                </tr>
              </table>
              
              <p style="color: ${form.textColor}; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">If you have any questions, just reply to this email.</p>
              
              <p style="color: ${form.textColor}; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Best regards,<br><strong>${form.emailFromName}</strong></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    ${form.showLogoInEmails ? footerLogoHtml : ''}
                    ${!form.showLogoInEmails ? `<p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 10px 0;"><strong>${form.companyName}</strong></p>` : ''}
                    ${form.companyAddress ? `<p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0 0 15px 0;">${form.companyAddress.replace(/\n/g, '<br>')}</p>` : ''}
                    
                    ${form.showSocialLinks && (form.twitterUrl || form.linkedinUrl || form.websiteUrl) ? `
                    <!-- Social Links -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 15px auto;">
                      <tr>
                        ${form.twitterUrl ? `<td style="padding: 0 10px;"><a href="${form.twitterUrl}" style="color: ${form.primaryColor}; text-decoration: none; font-size: 12px;">Twitter</a></td><td style="padding: 0 10px; color: #d1d5db;">|</td>` : ''}
                        ${form.linkedinUrl ? `<td style="padding: 0 10px;"><a href="${form.linkedinUrl}" style="color: ${form.primaryColor}; text-decoration: none; font-size: 12px;">LinkedIn</a></td><td style="padding: 0 10px; color: #d1d5db;">|</td>` : ''}
                        ${form.websiteUrl ? `<td style="padding: 0 10px;"><a href="${form.websiteUrl}" style="color: ${form.primaryColor}; text-decoration: none; font-size: 12px;">Website</a></td>` : ''}
                      </tr>
                    </table>
                    ` : ''}
                    
                    <!-- CAN-SPAM Compliance -->
                    <p style="color: #9ca3af; font-size: 11px; line-height: 1.5; margin: 20px 0 10px 0;">You're receiving this email because you're working on a project with ${form.companyName}.</p>
                    
                    <p style="color: #d1d5db; font-size: 11px; margin: 10px 0 0 0;">
                      <a href="#" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> | 
                      <a href="#" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="text-center py-12">Loading branding settings...</div>
      </div>
    );
  }

  return (
    <main className="p-6 lg:p-10">
      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Branding Settings</h1>
            <p className="text-gray-600 mt-1">
              Customize your brand appearance across emails, onboarding pages, and the platform
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="logo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="logo">
              <Upload className="mr-2 h-4 w-4" />
              Logo
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Palette className="mr-2 h-4 w-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="company">
              <Building2 className="mr-2 h-4 w-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="mr-2 h-4 w-4" />
              Social
            </TabsTrigger>
          </TabsList>

          {/* Logo Tab */}
          <TabsContent value="logo">
            <Card>
              <CardHeader>
                <CardTitle>Logo Upload</CardTitle>
                <CardDescription>
                  Upload your logo for use in emails, onboarding pages, and throughout the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Current Logo</Label>
                  {logoPreview ? (
                    <div className="mt-2 p-8 border-2 border-dashed rounded-lg flex items-center justify-center bg-white">
                      <img src={logoPreview} alt="Logo preview" className="max-h-32 object-contain" />
                    </div>
                  ) : (
                    <div className="mt-2 p-8 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                      <p className="text-gray-500">No logo uploaded</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="logo-upload">Upload New Logo (Auto-saves)</Label>
                  <div className="mt-2">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="w-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ✨ Your logo will upload and save automatically when you select a file<br/>
                    Recommended: PNG with transparent background, max 2MB, 200px height
                  </p>
                </div>

                <div>
                  <Label htmlFor="logo-url">Logo URL (Light Background)</Label>
                  <Input
                    id="logo-url"
                    value={form.logoUrl}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    placeholder="https://your-cdn.com/logo.png"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="logo-dark-url">Logo URL (Dark Background)</Label>
                  <Input
                    id="logo-dark-url"
                    value={form.logoDarkUrl}
                    onChange={(e) => setForm({ ...form, logoDarkUrl: e.target.value })}
                    placeholder="https://your-cdn.com/logo-dark.png"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Optional: Different logo for dark backgrounds
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
                <CardDescription>
                  Set your brand colors for consistent appearance (default: black, white, neon green)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="primary-color">Primary Color (Neon Green)</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={form.primaryColor}
                        onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={form.primaryColor}
                        onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                        placeholder="#00ff00"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondary-color">Secondary Color (Black)</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={form.secondaryColor}
                        onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={form.secondaryColor}
                        onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={form.accentColor}
                        onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={form.accentColor}
                        onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                        placeholder="#00ff00"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="text-color"
                        type="color"
                        value={form.textColor}
                        onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={form.textColor}
                        onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="background-color"
                        type="color"
                        value={form.backgroundColor}
                        onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={form.backgroundColor}
                        onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="mt-6">
                  <Label>Color Preview</Label>
                  <div 
                    className="mt-2 p-8 rounded-lg border-2"
                    style={{ backgroundColor: form.backgroundColor }}
                  >
                    <h3 
                      className="text-2xl font-bold mb-4" 
                      style={{ color: form.secondaryColor }}
                    >
                      {form.companyName}
                    </h3>
                    <Button 
                      style={{
                        backgroundColor: form.primaryColor,
                        color: form.secondaryColor,
                      }}
                    >
                      Primary Button
                    </Button>
                    <p 
                      className="mt-4"
                      style={{ color: form.textColor }}
                    >
                      This is how your brand colors will look throughout the platform.
                    </p>
                    <span
                      className="inline-block mt-2 px-3 py-1 rounded"
                      style={{
                        backgroundColor: form.accentColor,
                        color: form.secondaryColor,
                      }}
                    >
                      Accent Badge
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Used in email footers and CAN-SPAM compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Botmakers"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="company-address">Physical Address (Required for CAN-SPAM)</Label>
                  <Textarea
                    id="company-address"
                    value={form.companyAddress}
                    onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
                    placeholder="123 Main Street, Suite 100&#10;City, State 12345"
                    rows={3}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Required by law for email marketing (CAN-SPAM Act)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company-phone">Company Phone</Label>
                    <Input
                      id="company-phone"
                      value={form.companyPhone}
                      onChange={(e) => setForm({ ...form, companyPhone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company-email">Company Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={form.companyEmail}
                      onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
                      placeholder="hello@botmakers.com"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={form.supportEmail}
                    onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                    placeholder="support@botmakers.com"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="website-url">Website URL</Label>
                  <Input
                    id="website-url"
                    value={form.websiteUrl}
                    onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                    placeholder="https://botmakers.com"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Customize how your emails appear to recipients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="email-from-name">From Name</Label>
                  <Input
                    id="email-from-name"
                    value={form.emailFromName}
                    onChange={(e) => setForm({ ...form, emailFromName: e.target.value })}
                    placeholder="Botmakers"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Appears as the sender name in email clients
                  </p>
                </div>

                <div>
                  <Label htmlFor="email-footer-text">Email Footer Text (Optional)</Label>
                  <Textarea
                    id="email-footer-text"
                    value={form.emailFooterText}
                    onChange={(e) => setForm({ ...form, emailFooterText: e.target.value })}
                    placeholder="Additional footer message..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Show Logo in Emails</Label>
                    <p className="text-sm text-gray-500">Display your logo in email headers</p>
                  </div>
                  <Switch
                    checked={form.showLogoInEmails}
                    onCheckedChange={(checked) => setForm({ ...form, showLogoInEmails: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Show Social Links</Label>
                    <p className="text-sm text-gray-500">Include social media links in email footer</p>
                  </div>
                  <Switch
                    checked={form.showSocialLinks}
                    onCheckedChange={(checked) => setForm({ ...form, showSocialLinks: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Add your social media profiles (shown in email footers and onboarding pages)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="twitter-url">Twitter/X URL</Label>
                  <Input
                    id="twitter-url"
                    value={form.twitterUrl}
                    onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })}
                    placeholder="https://twitter.com/botmakers"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin-url">LinkedIn URL</Label>
                  <Input
                    id="linkedin-url"
                    value={form.linkedinUrl}
                    onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/company/botmakers"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="facebook-url">Facebook URL</Label>
                  <Input
                    id="facebook-url"
                    value={form.facebookUrl}
                    onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/botmakers"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram-url">Instagram URL</Label>
                  <Input
                    id="instagram-url"
                    value={form.instagramUrl}
                    onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/botmakers"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview Email Button */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Test Your Branding</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Preview how your branding looks in emails
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleReseedTemplates}>
                  <FileText className="mr-2 h-4 w-4" />
                  Update Email Templates
                </Button>
                <Button variant="outline" onClick={() => setShowEmailPreview(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Email
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              💡 After changing your website URL or other settings, click "Update Email Templates" to apply changes to all system emails
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Email Preview Modal */}
      <Dialog open={showEmailPreview} onOpenChange={setShowEmailPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              This is how your branded emails will look to recipients
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 border rounded-lg p-2 bg-gray-50">
            <div className="bg-white rounded overflow-auto" style={{ maxHeight: '70vh' }}>
              <iframe
                srcDoc={generatePreviewEmail()}
                className="w-full"
                style={{ height: '600px', border: 'none' }}
                title="Email Preview"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowEmailPreview(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
