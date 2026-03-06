"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Home, Info, Send, Briefcase, Mail } from "lucide-react";
import { saveCMSData } from "../actions/saveCms";

type Section = "home" | "cases" | "services" | "technologies" | "contact";

export default function AdminCMS() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const ADMIN_PASSWORD = "361admin";

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/data/content.json')
        .then(res => res.json())
        .then(data => {
          setContent(data);
        })
        .catch(error => console.error('Load error:', error));
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
      } else {
        alert("Invalid password");
      }
      setLoading(false);
    }, 500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveCMSData(content);
      if (result.success) {
        alert("All changes saved successfully!");
      } else {
        alert(`Error saving changes: ${result.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert("Error saving changes");
    }
    setSaving(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-white/5 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-white/5 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <h1 className="text-[#121bde] text-5xl font-bold tracking-wider">361°</h1>
            </div>
            <h2 className="text-3xl font-bold text-black mb-2">Admin Portal</h2>
            <p className="text-gray-600">Content Management System</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all"
                placeholder="Enter admin password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Authenticating...
                </>
              ) : (
                "Access CMS"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  const sections: Section[] = ["home", "cases", "services", "technologies", "contact"];
  const sectionLabels = {
    home: "Home Page",
    cases: "Cases",
    services: "Services",
    technologies: "Technologies",
    contact: "Contact"
  };
  const sectionIcons = {
    home: Home,
    cases: Info,
    services: Briefcase,
    technologies: Send,
    contact: Mail
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <h1 className="text-[#121bde] text-3xl font-bold tracking-wider">361°</h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 font-medium shadow-md transition-all hover:shadow-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save All Changes
                </>
              )}
            </button>
          </div>

          <div className="flex gap-2 justify-center overflow-x-auto pb-1">
            {sections.map((section) => {
              const Icon = sectionIcons[section];
              return (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeSection === section
                      ? "bg-black text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon size={18} />
                  {sectionLabels[section]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === "home" && <HomeEditor content={content.home} setContent={setContent} />}
        {activeSection === "cases" && <CasesEditor content={content.cases} setContent={setContent} />}
        {activeSection === "services" && <ServicesEditor content={content.services} setContent={setContent} />}
        {activeSection === "technologies" && <TechnologiesEditor content={content.technologies} setContent={setContent} />}
        {activeSection === "contact" && <ContactEditor content={content.contact} setContent={setContent} />}
      </div>
    </div>
  );
}

function HomeEditor({ content, setContent }: any) {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <h2 className="text-xl font-bold text-black mb-4 pb-3 border-b border-gray-200">
          Home Page Content
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Main Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                home: { ...prev.home, title: e.target.value }
              }))}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Subtitle</label>
            <input
              type="text"
              value={content.subtitle}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                home: { ...prev.home, subtitle: e.target.value }
              }))}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Footer Text</label>
            <input
              type="text"
              value={content.footer}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                home: { ...prev.home, footer: e.target.value }
              }))}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none text-gray-900"
            />
          </div>
        </div>
      </section>
    </div>
  );
}


function ServicesEditor({ content, setContent }: any) {
  const updateService = (index: number, field: string, value: any) => {
    setContent((prev: any) => ({
      ...prev,
      services: {
        items: prev.services.items.map((s: any, i: number) =>
          i === index ? { ...s, [field]: value } : s
        )
      }
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-bold text-black">Services We Offer</h2>

      {content.items.map((service: any, index: number) => (
        <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Service {index + 1}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
                Title
              </label>
              <input
                type="text"
                value={service.title}
                onChange={(e) => updateService(index, "title", e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
                placeholder="Web Development"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
                Description
              </label>
              <input
                type="text"
                value={service.description}
                onChange={(e) => updateService(index, "description", e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
                placeholder="Modern web applications"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TechnologiesEditor({ content, setContent }: any) {
  const updateTech = (index: number, field: string, value: any) => {
    setContent((prev: any) => ({
      ...prev,
      technologies: {
        ...prev.technologies,
        items: prev.technologies.items.map((t: any, i: number) =>
          i === index ? { ...t, [field]: value } : t
        )
      }
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-bold text-black">Technologies We Use</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
              Title
            </label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                technologies: { ...prev.technologies, title: e.target.value }
              }))}
              className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
              placeholder="How we do it?"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
              Description
            </label>
            <textarea
              value={content.description}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                technologies: { ...prev.technologies, description: e.target.value }
              }))}
              className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none resize-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
              rows={3}
              placeholder="We are using latest and most advanced technologies to provide products you are looking for."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {content.items.map((tech: any, index: number) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
                Technology Name
              </label>
              <input
                type="text"
                value={tech.name}
                onChange={(e) => updateTech(index, "name", e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-xs sm:text-sm"
                placeholder="JavaScript"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



function CasesEditor({ content, setContent }: any) {
  const [justAdded, setJustAdded] = useState<number | null>(null);

  const addProject = () => {
    const newIndex = content.projects.length;
    setContent((prev: any) => ({
      ...prev,
      cases: {
        projects: [
          ...prev.cases.projects,
          {
            category: "new category",
            title: "new project",
            slug: "new-project",
            brief: "Brief description of the project",
            implementation: "How the project was implemented",
            technologies: ["Technology 1", "Technology 2"]
          }
        ]
      }
    }));
    
    setJustAdded(newIndex);
    setTimeout(() => {
      const element = document.getElementById(`project-${newIndex}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    
    setTimeout(() => setJustAdded(null), 2000);
  };

  const updateProject = (index: number, field: string, value: any) => {
    setContent((prev: any) => ({
      ...prev,
      cases: {
        projects: prev.cases.projects.map((p: any, i: number) =>
          i === index ? { ...p, [field]: value } : p
        )
      }
    }));
  };

  const deleteProject = (index: number) => {
    setContent((prev: any) => ({
      ...prev,
      cases: { projects: prev.cases.projects.filter((_: any, i: number) => i !== index) }
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-black">Project Cases</h2>
        <button
          onClick={addProject}
          className="w-full sm:w-auto px-4 py-2 bg-black text-white text-sm rounded-xl hover:bg-gray-800 shadow-md transition-all hover:scale-105 active:scale-95"
        >
          + Add Project
        </button>
      </div>

      {content.projects.map((project: any, index: number) => (
        <div
          key={index}
          id={`project-${index}`}
          className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-500 ${
            justAdded === index ? 'animate-pulse border-black scale-105' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Project {index + 1}
              {justAdded === index && (
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-bounce">
                  New!
                </span>
              )}
            </h3>
            <button
              onClick={() => deleteProject(index)}
              className="text-red-600 hover:text-red-800 font-medium text-xs sm:text-sm transition-all hover:scale-110"
            >
              Remove
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={project.category}
                  onChange={(e) => updateProject(index, "category", e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
                  placeholder="mobile application"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => updateProject(index, "title", e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
                  placeholder="chiesi app"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
                Slug
              </label>
              <input
                type="text"
                value={project.slug}
                onChange={(e) => updateProject(index, "slug", e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
                placeholder="chiesi-app"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
                Brief
              </label>
              <textarea
                value={project.brief}
                onChange={(e) => updateProject(index, "brief", e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none resize-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
                rows={4}
                placeholder="A comprehensive healthcare mobile solution designed to streamline patient care and medical data management."
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
                Implementation
              </label>
              <textarea
                value={project.implementation}
                onChange={(e) => updateProject(index, "implementation", e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none resize-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
                rows={4}
                placeholder="Developed using React Native for cross-platform compatibility, integrated with secure cloud infrastructure for real-time data synchronization."
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                value={project.technologies.join(", ")}
                onChange={(e) => updateProject(index, "technologies", e.target.value.split(",").map((t: string) => t.trim()))}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
                placeholder="React Native, Node.js, PostgreSQL, AWS"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactEditor({ content, setContent }: any) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-bold text-black">Contact Information</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Contact Person
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
              Name
            </label>
            <input
              placeholder="Mateusz Walaszczyk"
              value={content.person.name}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                contact: { ...prev.contact, person: { ...prev.contact.person, name: e.target.value }}
              }))}
              className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
              Title
            </label>
            <input
              placeholder="Client Service Director"
              value={content.person.title}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                contact: { ...prev.contact, person: { ...prev.contact.person, title: e.target.value }}
              }))}
              className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
              Email
            </label>
            <input
              placeholder="m.walaszczyk@361.sh"
              value={content.person.email}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                contact: { ...prev.contact, person: { ...prev.contact.person, email: e.target.value }}
              }))}
              className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
              Phone
            </label>
            <input
              placeholder="+48 505 131 537"
              value={content.person.phone}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                contact: { ...prev.contact, person: { ...prev.contact.person, phone: e.target.value }}
              }))}
              className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
              Street
            </label>
            <input
              placeholder="Niedzwiedzia 29a"
              value={content.address.street}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                contact: { ...prev.contact, address: { ...prev.contact.address, street: e.target.value }}
              }))}
              className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
              City
            </label>
            <input
              placeholder="02-777 Warsaw, Poland"
              value={content.address.city}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                contact: { ...prev.contact, address: { ...prev.contact.address, city: e.target.value }}
              }))}
              className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
              Phone
            </label>
            <input
              placeholder="+48 22 400 44 88"
              value={content.address.phone}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                contact: { ...prev.contact, address: { ...prev.contact.address, phone: e.target.value }}
              }))}
              className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
              Email
            </label>
            <input
              placeholder="contact@361.sh"
              value={content.address.email}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                contact: { ...prev.contact, address: { ...prev.contact.address, email: e.target.value }}
              }))}
              className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Careers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
              Text
            </label>
            <input
              placeholder="Looking for new adventures?"
              value={content.careers.text}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                contact: { ...prev.contact, careers: { ...prev.contact.careers, text: e.target.value }}
              }))}
              className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">
              Email
            </label>
            <input
              placeholder="jobs@361.sh"
              value={content.careers.email}
              onChange={(e) => setContent((prev: any) => ({
                ...prev,
                contact: { ...prev.contact, careers: { ...prev.contact.careers, email: e.target.value }}
              }))}
              className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none placeholder-gray-400 text-gray-900 transition-all text-sm sm:text-base"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
