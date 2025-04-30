import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Users, Award, Rocket, Target, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">About Hindustan Founders Network</h1>
          <p className="text-xl text-gray-600 mb-8">
            Connecting India's brightest minds to build the future of innovation
          </p>
          <div className="relative rounded-lg overflow-hidden h-64 md:h-80">
            <img
              src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              alt="Founders collaborating"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
              <h2 className="text-white text-3xl font-bold px-4 text-center">Building India's Startup Ecosystem</h2>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                Hindustan Founders Network is dedicated to empowering entrepreneurs across India by providing a platform where founders, investors, and industry professionals can connect, collaborate, and grow together.
              </p>
              <p className="text-gray-600">
                We believe that by fostering a supportive community and providing access to resources, mentorship, and funding opportunities, we can help drive innovation and economic growth throughout the country.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="p-6 bg-primary/10 rounded-full">
                <Target className="h-32 w-32 text-primary" />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Community First</h3>
                  <p className="text-gray-600">
                    We believe in the power of community and collective wisdom to solve complex problems.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Excellence</h3>
                  <p className="text-gray-600">
                    We strive for excellence in everything we do, from the platform we build to the connections we foster.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Rocket className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Innovation</h3>
                  <p className="text-gray-600">
                    We embrace innovation and encourage creative thinking to tackle India's unique challenges.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Rajiv Sharma", role: "Founder & CEO", image: "https://randomuser.me/api/portraits/men/32.jpg" },
              { name: "Priya Patel", role: "COO", image: "https://randomuser.me/api/portraits/women/44.jpg" },
              { name: "Vikram Mehta", role: "CTO", image: "https://randomuser.me/api/portraits/men/68.jpg" },
              { name: "Ananya Singh", role: "Head of Community", image: "https://randomuser.me/api/portraits/women/65.jpg" },
            ].map((member, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-12 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5000+</div>
              <div className="text-gray-600">Founders</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">₹100Cr+</div>
              <div className="text-gray-600">Funding Facilitated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600">Startups Launched</div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-12">
          <div className="bg-primary text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
            <p className="mb-6">
              Connect with founders, investors, and professionals across India and be part of the startup revolution.
            </p>
            <div className="flex justify-center">
              <Button variant="secondary" size="lg">
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
