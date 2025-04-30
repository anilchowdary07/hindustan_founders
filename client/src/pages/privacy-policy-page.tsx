import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, FileText, Bell, Server } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            How we collect, use, and protect your information
          </p>
          <p className="text-gray-500 mt-2">Last updated: April 29, 2025</p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Introduction</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              At Hindustan Founders Network, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
            </p>
            <p>
              We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last Updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle>Information We Collect</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Personal Data</h3>
              <p className="mb-4">
                Personally identifiable information that you may provide to us when registering or using our services includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>First and last name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Mailing address</li>
                <li>Job title and company information</li>
                <li>Profile picture</li>
                <li>Professional background and experience</li>
                <li>Login credentials</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Derivative Data</h3>
              <p>
                Our servers automatically collect information when you access our platform, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the site. This information is used to maintain the quality of our service and provide general statistics regarding use of our platform.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Financial Data</h3>
              <p>
                We may collect financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) when you purchase a subscription or make a transaction on our platform. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor, and you are encouraged to review their privacy policy and contact them directly for responses to your questions.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Data From Social Networks</h3>
              <p>
                If you choose to link your account with us to a third-party social network such as LinkedIn, we may collect information from these social networks in accordance with your privacy settings on those networks.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Use of Your Information */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-primary" />
              <CardTitle>Use of Your Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the platform to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and manage your account</li>
              <li>Compile anonymous statistical data for research purposes</li>
              <li>Email you regarding your account or order</li>
              <li>Fulfill and manage transactions</li>
              <li>Generate a personal profile about you to make future visits to the platform more personalized</li>
              <li>Increase the efficiency and operation of the platform</li>
              <li>Monitor and analyze usage and trends to improve your experience with the platform</li>
              <li>Notify you of updates to the platform</li>
              <li>Offer new products, services, and/or recommendations to you</li>
              <li>Perform other business activities as needed</li>
              <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity</li>
              <li>Process payments and refunds</li>
              <li>Request feedback and contact you about your use of the platform</li>
              <li>Resolve disputes and troubleshoot problems</li>
              <li>Respond to product and customer service requests</li>
              <li>Send you a newsletter</li>
            </ul>
          </CardContent>
        </Card>

        {/* Disclosure of Your Information */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Server className="h-6 w-6 text-primary" />
              <CardTitle>Disclosure of Your Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
            
            <div>
              <h3 className="text-lg font-medium mb-2">By Law or to Protect Rights</h3>
              <p>
                If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Third-Party Service Providers</h3>
              <p>
                We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Marketing Communications</h3>
              <p>
                With your consent, or with an opportunity for you to withdraw consent, we may share your information with third parties for marketing purposes, as permitted by law.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Interactions with Other Users</h3>
              <p>
                If you interact with other users of the platform, those users may see your name, profile photo, and descriptions of your activity.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Business Transfers</h3>
              <p>
                If we or our subsidiaries are involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction. We will notify you before your information is transferred and becomes subject to a different Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security of Your Information */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-primary" />
              <CardTitle>Security of Your Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
            <p>
              Any information disclosed online is vulnerable to interception and misuse by unauthorized parties. Therefore, we cannot guarantee complete security if you provide personal information.
            </p>
          </CardContent>
        </Card>

        {/* Your Privacy Rights */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <CardTitle>Your Privacy Rights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              You have rights regarding the personal information we collect about you. Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request that we correct any personal information we hold about you that is inaccurate</li>
              <li>Request that we delete any personal information we hold about you</li>
              <li>Restrict the processing of your personal information</li>
              <li>Object to the processing of your personal information</li>
              <li>Request portability of your personal information</li>
              <li>Withdraw your consent at any time where we relied on your consent to process your personal information</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us using the contact information provided below.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4">
              <p className="font-medium">Hindustan Founders Network</p>
              <p>Level 8, Cyber Tower</p>
              <p>Hitech City, Hyderabad</p>
              <p>Telangana, India - 500081</p>
              <p className="mt-2">Email: privacy@hindustanfounders.net</p>
              <p>Phone: +91 98765 43210</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
