import {
  Scale,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  BarChart3,
  Users,
  FileText,
  Clock,
  Brain,
  AlertTriangle,
  TrendingUp,
  Award,
  Globe,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Extraction",
      description:
        "Advanced AI automatically extracts key information, action items, and deadlines from court judgments with 95% accuracy.",
      color: "bg-purple-500",
    },
    {
      icon: CheckCircle,
      title: "Human Verification",
      description:
        "Expert verifiers review and validate AI-extracted data ensuring 100% accuracy before department assignment.",
      color: "bg-green-500",
    },
    {
      icon: Clock,
      title: "Automated Tracking",
      description:
        "Real-time monitoring of case progress with automated deadline reminders and compliance alerts.",
      color: "bg-blue-500",
    },
    {
      icon: Users,
      title: "Department Collaboration",
      description:
        "Seamless assignment and coordination across multiple government departments for efficient action.",
      color: "bg-orange-500",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Comprehensive insights and reports on case processing, department performance, and compliance rates.",
      color: "bg-indigo-500",
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description:
        "Government-grade security with role-based access control and complete audit trails.",
      color: "bg-red-500",
    },
  ];

  const benefits = [
    {
      stat: "75%",
      label: "Faster Processing",
      description: "Reduce case processing time from days to hours",
    },
    {
      stat: "95%",
      label: "Accuracy Rate",
      description: "AI-powered extraction with human verification",
    },
    {
      stat: "100%",
      label: "Transparency",
      description: "Complete visibility into case status and actions",
    },
    {
      stat: "24/7",
      label: "Availability",
      description: "Access the system anytime, anywhere",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Upload Judgment",
      description:
        "Administrators upload court judgment PDF documents into the secure system",
      icon: FileText,
    },
    {
      step: "02",
      title: "AI Processing",
      description:
        "Advanced AI extracts case details, action items, deadlines, and department assignments",
      icon: Brain,
    },
    {
      step: "03",
      title: "Human Verification",
      description:
        "Expert verifiers review, edit, and approve the extracted information for accuracy",
      icon: CheckCircle,
    },
    {
      step: "04",
      title: "Department Action",
      description:
        "Approved cases are automatically assigned to relevant departments for execution",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#8B0000] rounded-full flex items-center justify-center">
              <Scale className="w-7 h-7 text-[#FFD700]" />
            </div>
            <div>
              <div className="text-lg text-gray-900">
                Court Judgment Intelligence
              </div>
              <div className="text-xs text-gray-500">
                Government of Karnataka
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            
            <button
              onClick={onGetStarted}
              className="bg-[#8B0000] text-white px-6 py-2 rounded-lg hover:bg-[#6B0000] transition-colors shadow-md text-sm"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#8B0000] via-[#6B0000] to-[#4B0000] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 border-4 border-[#FFD700] rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 border-4 border-[#FFD700] rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 border-4 border-[#FFD700] rotate-45"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-[#FFD700] text-[#8B0000] rounded-full text-sm">
                ⚡ Transforming Justice into Action
              </div>
              <h1 className="text-5xl leading-tight">
                Court Judgment to Action Intelligence System
              </h1>
              <p className="text-xl text-gray-200">
                Leveraging AI to transform court judgments into actionable
                insights, ensuring swift compliance and transparent governance
                across Karnataka.
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={onGetStarted}
                  className="bg-[#FFD700] text-[#8B0000] px-8 py-4 rounded-lg hover:bg-[#FFC700] transition-colors shadow-lg flex items-center gap-2 group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl">1,234+</div>
                  <div className="text-sm text-gray-300">Cases Processed</div>
                </div>
                <div>
                  <div className="text-3xl">15+</div>
                  <div className="text-sm text-gray-300">Departments</div>
                </div>
                <div>
                  <div className="text-3xl">95%</div>
                  <div className="text-sm text-gray-300">Accuracy</div>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl text-[#8B0000] mb-2">
                  {benefit.stat}
                </div>
                <div className="text-gray-900 mb-1">{benefit.label}</div>
                <div className="text-sm text-gray-600">
                  {benefit.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-red-100 text-[#8B0000] rounded-full text-sm mb-4">
              ✨ Powerful Features
            </div>
            <h2 className="text-4xl text-gray-900 mb-4">
              Built for Government Efficiency
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive platform designed to streamline court judgment
              processing and ensure timely compliance with judicial directives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-100 rounded-xl p-8 hover:border-[#8B0000] hover:shadow-lg transition-all group"
                >
                  <div
                    className={`${feature.color} w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

     
      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                💡 Key Benefits
              </div>
              <h2 className="text-4xl text-gray-900">
                Why Choose Our Platform?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg text-gray-900 mb-1">
                      Reduce Manual Effort
                    </div>
                    <div className="text-gray-600">
                      Eliminate hours of manual reading and data entry with
                      AI-powered extraction
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg text-gray-900 mb-1">
                      Ensure Compliance
                    </div>
                    <div className="text-gray-600">
                      Never miss a deadline with automated tracking and alerts
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg text-gray-900 mb-1">
                      Improve Transparency
                    </div>
                    <div className="text-gray-600">
                      Real-time visibility into case status across all
                      departments
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg text-gray-900 mb-1">
                      Data-Driven Insights
                    </div>
                    <div className="text-gray-600">
                      Make informed decisions with comprehensive analytics and
                      reports
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white">
                <TrendingUp className="w-12 h-12 mb-4 opacity-80" />
                <div className="text-3xl mb-2">4.2 days</div>
                <div className="text-purple-100">Average Processing Time</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white">
                <Award className="w-12 h-12 mb-4 opacity-80" />
                <div className="text-3xl mb-2">98%</div>
                <div className="text-blue-100">User Satisfaction</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white">
                <AlertTriangle className="w-12 h-12 mb-4 opacity-80" />
                <div className="text-3xl mb-2">0</div>
                <div className="text-green-100">Missed Deadlines</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-8 text-white">
                <Globe className="w-12 h-12 mb-4 opacity-80" />
                <div className="text-3xl mb-2">15+</div>
                <div className="text-orange-100">Active Departments</div>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      
    </div>
  );
}
