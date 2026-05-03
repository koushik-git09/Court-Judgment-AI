import { CheckCircle, XCircle, Edit, AlertTriangle, Brain, Lightbulb, FileText, Calendar, Building2, Target } from 'lucide-react';
import { useState } from 'react';

export function VerifierDashboard() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    caseId: 'CJ-2026-001',
    caseName: 'State vs. Transport Authority',
    actionPlan: 'Issue new bus permits within 30 days',
    deadline: '2026-05-31',
    department: 'Transport',
    confidence: 92,
  });

  const aiExplanations = [
    {
      field: 'Case Identification',
      extracted: 'CJ-2026-001',
      reason: 'Identified from the case number header on page 1, line 3 of the judgment document.',
      confidence: 98,
      icon: FileText,
    },
    {
      field: 'Action Plan',
      extracted: 'Issue new bus permits within 30 days',
      reason: 'Extracted from the directive section (page 8, paragraph 4) where the court explicitly states "The Transport Authority is hereby directed to issue new bus permits within a period of 30 days from the date of this order."',
      confidence: 95,
      icon: Target,
    },
    {
      field: 'Deadline',
      extracted: '2026-05-31',
      reason: 'Calculated as 30 days from judgment date (2026-05-01). The court specified "within 30 days from the date of this order" in the final directive.',
      confidence: 100,
      icon: Calendar,
    },
    {
      field: 'Responsible Department',
      extracted: 'Transport Department',
      reason: 'Identified from repeated references to "Transport Authority" and "Department of Transport, Government of Karnataka" throughout the judgment, particularly in pages 2, 5, and 8.',
      confidence: 92,
      icon: Building2,
    },
  ];

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900">AI-Assisted Verification</h2>
            <p className="text-sm text-gray-600">Review AI-extracted information with detailed explanations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-250px)]">
          {/* AI Explanation Cards */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <h3 className="text-gray-900">AI Extraction Analysis</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Our AI has analyzed the court judgment and extracted key information. Review each extraction below with detailed reasoning.
            </p>
            <div className="space-y-3">
              {aiExplanations.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm text-purple-900">{item.field}</div>
                          <div className="text-xs text-gray-500">{item.confidence}% confidence</div>
                        </div>
                        <div className="text-xs text-gray-900 bg-gray-50 px-2 py-1 rounded mb-2">
                          <span className="text-gray-500">Extracted: </span>
                          <span className="font-medium">{item.extracted}</span>
                        </div>
                        <div className="text-xs text-gray-600 leading-relaxed">
                          <span className="text-purple-600">Why: </span>
                          {item.reason}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                      <div
                        className="bg-purple-500 h-1 rounded-full"
                        style={{ width: `${item.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extracted Information Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Extracted Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-[#2563EB] hover:text-[#1E40AF] flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Case ID</label>
                <input
                  type="text"
                  value={formData.caseId}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Case Name</label>
                <input
                  type="text"
                  value={formData.caseName}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, caseName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Action Plan</label>
                <textarea
                  value={formData.actionPlan}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, actionPlan: e.target.value })}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] disabled:opacity-60 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Department</label>
                  <select
                    value={formData.department}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] disabled:opacity-60"
                  >
                    <option>Transport</option>
                    <option>Revenue</option>
                    <option>Education</option>
                    <option>Health</option>
                    <option>PWD</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-500">AI Confidence Score</label>
                  <span className="text-sm text-gray-900">{formData.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${formData.confidence}%` }}
                  ></div>
                </div>
                {formData.confidence < 80 && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-yellow-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Low confidence - Manual review recommended</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <div className="mb-1">Review Notes:</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Verify deadline matches court order</li>
                  <li>Confirm department assignment</li>
                  <li>Check action plan completeness</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col overflow-y-auto max-h-[calc(100vh-250px)]">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <h3 className="text-gray-900">Original Court Judgment</h3>
            <div className="text-xs text-gray-500">judgment_2026_001.pdf</div>
          </div>

          {/* PDF Viewer Simulation */}
          <div className="flex-1 bg-gray-100 rounded-lg border-2 border-gray-300 overflow-hidden">
            {/* PDF Toolbar */}
            <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">←</button>
                <span>Page 8 of 12</span>
                <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">→</button>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">Zoom -</button>
                <span>100%</span>
                <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">Zoom +</button>
              </div>
            </div>

            {/* PDF Content */}
            <div className="bg-white p-8 space-y-4 min-h-[600px]">
              <div className="text-center mb-6">
                <div className="text-xs text-gray-500 mb-2">IN THE HIGH COURT OF KARNATAKA</div>
                <div className="text-sm text-gray-900 mb-1">WRIT PETITION NO. 12345 OF 2026</div>
                <div className="text-xs text-gray-600">State vs. Transport Authority</div>
              </div>

              <div className="border-t border-gray-300 pt-4 space-y-3 text-xs text-gray-800 leading-relaxed">
                <p>
                  Having heard the arguments of both parties and after careful consideration of the facts and circumstances of the case, this Court passes the following order:
                </p>

                <p className="font-medium text-gray-900">ORDER</p>

                <p>
                  1. The petition is allowed in part.
                </p>

                <p>
                  2. The Transport Authority is found to have delayed the processing of bus permit applications without sufficient justification.
                </p>

                <p>
                  3. <span className="bg-yellow-200 px-1 font-medium">In view of the public interest and to ensure compliance with the Motor Vehicles Act, 1988, the Transport Authority is hereby directed to process and issue new bus permits</span> to eligible applicants for rural routes in the districts of Belgaum, Dharwad, and Bagalkot.
                </p>

                <p>
                  4. <span className="bg-yellow-200 px-1 font-medium">The said permits shall be issued within a period of 30 days from the date of this order.</span>
                </p>

                <p>
                  5. <span className="bg-yellow-200 px-1 font-medium">The Department of Transport, Government of Karnataka</span>, shall ensure that all procedural requirements are expedited and completed within the stipulated timeframe.
                </p>

                <p>
                  6. The Transport Authority shall file a compliance report with this Court within 45 days from the date of this order, detailing the number of permits issued and the status of pending applications.
                </p>

                <p>
                  7. The Registry is directed to monitor compliance and list this matter for further hearing on 15th July 2026.
                </p>

                <p className="pt-4">
                  Pronounced in open court on this <span className="bg-green-200 px-1">1st day of May, 2026</span>.
                </p>

                <div className="pt-8 text-right">
                  <div className="text-sm text-gray-900">Sd/-</div>
                  <div className="text-sm text-gray-900">JUSTICE RAMESH KUMAR</div>
                  <div className="text-xs text-gray-600">HIGH COURT OF KARNATAKA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Highlighted References */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs text-yellow-900 mb-2">📌 Key Extractions Highlighted:</div>
            <div className="space-y-1 text-xs text-yellow-800">
              <div>• <span className="bg-yellow-200 px-1">Action directive</span> - Paragraph 3-4</div>
              <div>• <span className="bg-yellow-200 px-1">Deadline specification</span> - Paragraph 4</div>
              <div>• <span className="bg-yellow-200 px-1">Department reference</span> - Paragraph 5</div>
              <div>• <span className="bg-green-200 px-1">Judgment date</span> - Final paragraph</div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-2.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1E40AF] transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            {isEditing ? 'Save Changes' : 'Edit Information'}
          </button>
          <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Reject
          </button>
          <button className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md">
            <CheckCircle className="w-4 h-4" />
            Approve & Forward
          </button>
        </div>
      </div>
    </div>
  );
}
