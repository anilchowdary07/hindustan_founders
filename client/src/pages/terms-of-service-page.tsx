import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Scroll, BookOpen, Info, ShieldCheck, Scale, AlertCircle, Cookie } from "lucide-react";

export default function TermsOfServicePage() {
  const [, navigate] = useLocation();
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Please read these terms carefully before using our platform
          </p>
          <p className="text-gray-500 mt-2">Last updated: May 1, 2025</p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Scroll className="h-6 w-6 text-primary" />
              <CardTitle>Introduction</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              These Terms of Service ("Terms") govern your access to and use of the Hindustan Founders Network website, apps, and services ("Services"). By accessing or using our Services, you agree to be bound by these Terms, our Privacy Policy, and our Cookie Policy.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button variant="outline" size="sm" onClick={() => navigate("/privacy-policy")}>
                Privacy Policy
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/cookie-policy")}>
                Cookie Policy
              </Button>
            </div>
            <p>
              If you are using our Services on behalf of an organization, you are agreeing to these Terms for that organization and representing that you have the authority to bind that organization to these Terms. In that case, "you" and "your" will refer to that organization.
            </p>
            <p>
              We may modify these Terms at any time, and such modifications shall be effective immediately upon posting the modified Terms on the platform. Your continued use of the Services following the posting of modified Terms constitutes your acceptance of those changes.
            </p>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle>Eligibility and Account Creation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              To use the Services, you must be at least 18 years of age and have the legal capacity to enter into contracts. By creating an account, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are at least 18 years old</li>
              <li>You will provide accurate, current, and complete information during the registration process</li>
              <li>You will maintain and promptly update your registration information to keep it accurate, current, and complete</li>
              <li>You will be solely responsible for safeguarding your account credentials</li>
              <li>You will notify us immediately of any unauthorized use of your account</li>
              <li>You accept all risks of any authorized or unauthorized access to your account</li>
            </ul>
            <p className="mt-4">
              We reserve the right to refuse access to the Services to anyone for any reason at any time.
            </p>
          </CardContent>
        </Card>

        {/* Cookies and Tracking Technologies */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Cookie className="h-6 w-6 text-primary" />
              <CardTitle>Cookies and Tracking Technologies</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and to hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </p>
            <p>
              By using our Services, you consent to our use of cookies and similar technologies in accordance with our Cookie Policy. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Services.
            </p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => navigate('/cookie-policy')}
            >
              <Cookie className="mr-2 h-4 w-4" />
              View Cookie Policy
            </Button>
          </CardContent>
        </Card>

        {/* License and Restrictions */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle>License and Restrictions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">License to Use the Services</h3>
              <p>
                Subject to these Terms, we grant you a non-exclusive, non-transferable, non-sublicensable, revocable license to use the Services for your personal or internal business purposes.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Restrictions</h3>
              <p className="mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Services in any way that violates any applicable local, state, national, or international law or regulation</li>
                <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Services</li>
                <li>Use the Services in any manner that could disable, overburden, damage, or impair the site</li>
                <li>Use any robot, spider, or other automatic device, process, or means to access the Services for any purpose, including monitoring or copying any of the material on the platform</li>
                <li>Use any manual process to monitor or copy any of the material on the platform or for any other unauthorized purpose</li>
                <li>Use any device, software, or routine that interferes with the proper working of the Services</li>
                <li>Introduce any viruses, trojan horses, worms, logic bombs, or other material which is malicious or technologically harmful</li>
                <li>Attempt to decompile, reverse engineer, disassemble, or otherwise reduce any part of the Services to a human-readable form</li>
                <li>Access the Services in order to build a competitive product or service</li>
                <li>Copy, modify, create derivative works of, publicly display, publicly perform, republish, transmit, or distribute the Services</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* User Content */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Info className="h-6 w-6 text-primary" />
              <CardTitle>User Content</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Services may allow you to create, upload, post, send, receive, and store content, including but not limited to text, photos, videos, and links ("User Content"). You retain ownership rights in your User Content.
            </p>
            <p>
              By providing User Content through the Services, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, modify, distribute, create derivative works of, display, and perform your User Content in connection with the operation of the Services.
            </p>
            <p>
              You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You own or have the necessary rights to your User Content and the right to grant the license to us</li>
              <li>Your User Content does not violate the privacy rights, publicity rights, copyrights, contract rights, intellectual property rights, or any other rights of any person</li>
              <li>Your User Content does not contain material that is defamatory, obscene, indecent, harassing, threatening, harmful, invasive of privacy or publicity rights, abusive, inflammatory, or otherwise objectionable</li>
            </ul>
            <p className="mt-4">
              We are not responsible or liable for any User Content. While we reserve the right to monitor, review, and remove User Content, we have no obligation to do so.
            </p>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Scale className="h-6 w-6 text-primary" />
              <CardTitle>Intellectual Property</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Services and their entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio) are owned by Hindustan Founders Network, its licensors, or other providers of such material and are protected by Indian and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
            <p>
              The Hindustan Founders Network name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Hindustan Founders Network or its affiliates. You must not use such marks without the prior written permission of Hindustan Founders Network. All other names, logos, product and service names, designs, and slogans on the platform are the trademarks of their respective owners.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-primary" />
              <CardTitle>Termination</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may terminate or suspend your account and access to the Services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
            <p>
              Upon termination, your right to use the Services will immediately cease. If you wish to terminate your account, you may simply discontinue using the Services or contact us to request account deletion.
            </p>
            <p>
              All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL HINDUSTAN FOUNDERS NETWORK OR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES</li>
              <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES</li>
              <li>ANY CONTENT OBTAINED FROM THE SERVICES</li>
              <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
            </ul>
            <p className="mt-4">
              WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>
            <p>
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
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
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4">
              <p className="font-medium">Hindustan Founders Network</p>
              <p>Level 8, Cyber Tower</p>
              <p>Hitech City, Hyderabad</p>
              <p>Telangana, India - 500081</p>
              <p className="mt-2">Email: legal@hindustanfounders.net</p>
              <p>Phone: +91 98765 43210</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button onClick={() => navigate("/privacy-policy")}>
                Privacy Policy
              </Button>
              <Button variant="outline" onClick={() => navigate("/cookie-policy")}>
                Cookie Policy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
