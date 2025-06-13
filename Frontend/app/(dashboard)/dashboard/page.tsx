// ParentDashboard.tsx (Responsive Version)
"use client";

import { useState } from "react";
import { LayoutDashboard, Brain, BarChart2, FileText } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "activities", label: "Activities", icon: Brain },
  { id: "progress", label: "Progress", icon: BarChart2 },
  { id: "logs", label: "Visit Logs", icon: FileText },
];

const progressData = [
  { domain: "Cognitive", value: 60 },
  { domain: "Motor Skills", value: 45 },
  { domain: "Social-Emotional", value: 30 },
  { domain: "Communication", value: 40 },
];

const progressColors = ["#f97316", "#facc15", "#60a5fa", "#34d399"];

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 border-l-4 border-orange-400 rounded-xl p-6 shadow">
              <h2 className="text-3xl font-bold text-orange-600 mb-1">
                Welcome, Parent 👩‍👧
              </h2>
              <p className="text-sm text-gray-700">
                Your child's progress and guidance in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  👶 Child Profile
                </h3>
                <p className="text-sm text-gray-700">Name: Aryan</p>
                <p className="text-sm text-gray-700">Age: 3 years</p>
                <p className="text-sm text-gray-700">
                  Development Status: 🚧 Needs Support
                </p>
              </div>

              <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  📈 Progress
                </h3>
                <div className="w-full bg-orange-100 rounded-full h-4">
                  <div
                    className="bg-orange-500 h-4 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  45% milestones completed
                </p>
                <button className="mt-4 text-sm text-orange-600 font-medium hover:underline">
                  View Full Report
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🤖 Daily Activity Suggestion
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                🧠 Activity: Shape Sorting
              </p>
              <p className="text-sm text-gray-700">
                Purpose: Enhances visual recognition and cognitive motor
                coordination.
              </p>
              <button className="mt-4 text-sm text-orange-600 font-medium hover:underline">
                More Suggestions
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                💬 Parenting Help Chatbot
              </h3>
              <input
                type="text"
                placeholder="Ask something like: 'He doesn't eat'"
                className="w-full border border-gray-300 rounded-md p-2 text-sm mb-2"
              />
              <button className="text-sm bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600">
                Ask
              </button>
            </div>
          </div>
        );

      case "activities":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
              <h2 className="text-2xl font-bold mb-4 text-orange-500">
                📚 Weekly Activities Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "Shape Puzzle", status: "Complete", emoji: "🧩" },
                  { name: "Color Sorting", status: "Pending", emoji: "🎨" },
                  { name: "Story Reading", status: "In Progress", emoji: "📖" },
                  { name: "Animal Sounds", status: "Pending", emoji: "🐾" },
                  { name: "Drawing Shapes", status: "Complete", emoji: "✏️" },
                  { name: "Memory Match", status: "In Progress", emoji: "🧠" },
                ].map((activity, i) => (
                  <div
                    key={i}
                    className="p-4 bg-orange-50 rounded-lg shadow-sm border hover:shadow-md transition"
                  >
                    <h3 className="text-md font-semibold text-gray-800 mb-1">
                      {activity.emoji} {activity.name}
                    </h3>
                    <p
                      className={`text-sm font-medium ${
                        activity.status === "Complete"
                          ? "text-green-600"
                          : activity.status === "In Progress"
                          ? "text-blue-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {activity.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "progress":
        return (
          <div className="bg-white p-6 rounded-xl shadow border border-orange-100">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">
              📊 Domain-wise Progress
            </h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={progressData}
                  layout="vertical"
                  margin={{ top: 20, right: 20, bottom: 20, left: 120 }}
                >
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    dataKey="domain"
                    type="category"
                    tick={{ fontSize: 14, width: 100, wordBreak: "break-word" }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                    {progressData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={progressColors[index % progressColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "logs":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-orange-500">
              📋 Visit Logs
            </h2>

            {[
              {
                volunteer: "Ritu Sharma",
                date: "June 5, 2025",
                observation:
                  "Excellent engagement. Child was attentive and responsive.",
              },
              {
                volunteer: "Amit Kumar",
                date: "May 28, 2025",
                observation:
                  "Child struggled to follow verbal cues. Needs support in attention.",
              },
              {
                volunteer: "Pooja Das",
                date: "May 20, 2025",
                observation:
                  "Child was shy initially but responded to storytelling activities.",
              },
            ].map((log, index) => (
              <div
                key={index}
                className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg shadow-sm"
              >
                <p className="text-sm font-semibold text-orange-600">
                  🧑‍🤝‍🧑 Volunteer: {log.volunteer}
                </p>
                <p className="text-sm text-gray-700">📅 Date: {log.date}</p>
                <p className="text-sm text-gray-700">
                  📝 Observation: {log.observation}
                </p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fefcf9] font-sans">
      <aside className="w-full md:w-64 bg-white shadow-xl border-r border-gray-200 p-6 space-y-4">
        <h1 className="text-xl font-extrabold text-orange-600 mb-6">
          ChildCare Connect
        </h1>
        <nav className="space-y-2 flex md:block overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition ${
                activeTab === id
                  ? "bg-orange-100 text-orange-700"
                  : "text-gray-800 hover:bg-orange-50"
              }`}
            >
              <Icon className="w-5 h-5" /> {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        <div className="rounded-xl shadow-xl bg-white p-4 sm:p-6 border border-orange-100">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
