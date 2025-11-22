import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { OnboardingData, RiskProfile, Timeline, Focus } from '@/shared/types';

const Popup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState<boolean>(false);
  const [data, setData] = useState<OnboardingData>({
    riskProfile: null,
    timeline: null,
    focus: null,
    specificGoal: "",
  });

  useEffect(() => {
    // Check if onboarding is already complete
    chrome.storage.sync.get(['girlMathProfile', 'onboardingComplete'], (result) => {
      if (result.onboardingComplete && result.girlMathProfile) {
        setIsComplete(true);
        setData(result.girlMathProfile);
      }
      setIsLoading(false);
    });
  }, []);

  const handleComplete = () => {
    chrome.storage.sync.set({ 
      girlMathProfile: data,
      onboardingComplete: true 
    }, () => {
      setShowCompletionScreen(true);
      // Show completion screen for 2 seconds, then switch to dashboard
      setTimeout(() => {
        setShowCompletionScreen(false);
        setIsComplete(true);
      }, 2000);
    });
  };

  const getRiskProfileLabel = (profile: RiskProfile | null) => {
    const labels: Record<RiskProfile, { label: string; emoji: string }> = {
      safe: { label: "Conservative", emoji: "🛡️" },
      balanced: { label: "Balanced", emoji: "⚖️" },
      mainCharacter: { label: "Aggressive", emoji: "📈" },
    };
    return profile ? labels[profile] : null;
  };

  const getTimelineLabel = (timeline: Timeline | null) => {
    const labels: Record<Timeline, { label: string; sublabel: string; emoji: string }> = {
      short: { label: "Short-term", sublabel: "0-2 years", emoji: "⏰" },
      mid: { label: "Mid-term", sublabel: "2-5 years", emoji: "📅" },
      long: { label: "Long-term", sublabel: "5+ years", emoji: "🔮" },
    };
    return timeline ? labels[timeline] : null;
  };

  const getFocusLabel = (focus: Focus | null) => {
    const labels: Record<Focus, { label: string; emoji: string }> = {
      impulse: { label: "Reduce impulse buys", emoji: "🛍️" },
      confidence: { label: "Build investing confidence", emoji: "💪" },
      future: { label: "Understand my financial future", emoji: "🔭" },
      goal: { label: "Save for a specific goal", emoji: "🎯" },
    };
    return focus ? labels[focus] : null;
  };

  const canProceed = () => {
    if (step === 1) return data.riskProfile !== null;
    if (step === 2) return data.timeline !== null;
    if (step === 3) return data.focus !== null;
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (showCompletionScreen) {
    return (
      <div className="min-h-[500px] bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl p-8 shadow-lg text-center animate-fade-in">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-3xl font-serif mb-4">Setup Complete!</h1>
          <p className="text-gray-600">
            Your profile has been saved. You're all set to start using the extension!
          </p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const riskProfile = getRiskProfileLabel(data.riskProfile);
    const timeline = getTimelineLabel(data.timeline);
    const focus = getFocusLabel(data.focus);

    return (
      <div className="min-h-[500px] bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-serif text-gray-900 mb-2">Your Profile</h1>
            <p className="text-gray-600">Here's your personalized financial profile</p>
          </div>

          {/* Dashboard Cards */}
          <div className="space-y-4">
            {/* Risk Profile Card */}
            {riskProfile && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{riskProfile.emoji}</span>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Investment Approach</p>
                      <p className="text-lg font-semibold text-gray-900">{riskProfile.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Card */}
            {timeline && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{timeline.emoji}</span>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Time Horizon</p>
                      <p className="text-lg font-semibold text-gray-900">{timeline.label}</p>
                      <p className="text-sm text-gray-500">{timeline.sublabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Focus/Goal Card */}
            {focus && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{focus.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Main Goal</p>
                      <p className="text-lg font-semibold text-gray-900">{focus.label}</p>
                      {data.focus === "goal" && data.specificGoal && (
                        <p className="text-sm text-primary-600 mt-2 font-medium">
                          "{data.specificGoal}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edit Button */}
          <div className="mt-6">
            <button
              onClick={() => {
                chrome.storage.sync.remove(['onboardingComplete', 'girlMathProfile'], () => {
                  setIsComplete(false);
                  setShowCompletionScreen(false);
                  setStep(1);
                  setData({
                    riskProfile: null,
                    timeline: null,
                    focus: null,
                    specificGoal: "",
                  });
                });
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Edit Preferences
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[500px] bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-600">
              Step {step} of 3
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg animate-fade-in">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-serif text-gray-900">
                  What's your investment approach?
                </h1>
                <p className="text-gray-600">
                  This helps us personalize your perspective
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { value: "safe", label: "Conservative", emoji: "🛡️" },
                  { value: "balanced", label: "Balanced", emoji: "⚖️" },
                  { value: "mainCharacter", label: "Aggressive", emoji: "📈" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setData({ ...data, riskProfile: option.value as RiskProfile })}
                    className={`w-full h-16 text-lg justify-start px-4 rounded-lg transition-all duration-200 flex items-center ${
                      data.riskProfile === option.value
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span className="mr-3 text-2xl">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-serif text-gray-900">
                  What's your time horizon?
                </h1>
                <p className="text-gray-600">
                  When are you planning to use this money?
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { value: "short", label: "Short-term", sublabel: "0-2 years", emoji: "⏰" },
                  { value: "mid", label: "Mid-term", sublabel: "2-5 years", emoji: "📅" },
                  { value: "long", label: "Long-term", sublabel: "5+ years", emoji: "🔮" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setData({ ...data, timeline: option.value as Timeline })}
                    className={`w-full h-16 text-lg justify-start px-4 rounded-lg transition-all duration-200 flex items-center ${
                      data.timeline === option.value
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center w-full">
                      <span className="mr-3 text-2xl">{option.emoji}</span>
                      <div className="text-left flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className={`text-sm ${data.timeline === option.value ? 'text-primary-100' : 'text-gray-500'}`}>
                          {option.sublabel}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-serif text-gray-900">
                  What's your main goal?
                </h1>
                <p className="text-gray-600">
                  We'll tailor your perspective
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { value: "impulse", label: "Reduce impulse buys", emoji: "🛍️" },
                  { value: "confidence", label: "Build investing confidence", emoji: "💪" },
                  { value: "future", label: "Understand my financial future", emoji: "🔭" },
                  { value: "goal", label: "Save for a specific goal", emoji: "🎯" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setData({ ...data, focus: option.value as Focus })}
                    className={`w-full h-16 text-lg justify-start px-4 rounded-lg transition-all duration-200 flex items-center ${
                      data.focus === option.value
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span className="mr-3 text-2xl">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
              {data.focus === "goal" && (
                <div className="animate-fade-in">
                  <input
                    type="text"
                    placeholder="e.g., Trip to Korea"
                    value={data.specificGoal}
                    onChange={(e) => setData({ ...data, specificGoal: e.target.value })}
                    className="w-full h-12 text-lg px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </button>
            )}
            <button
              className={`flex-1 h-12 text-lg font-semibold rounded-lg transition-all duration-200 ${
                canProceed()
                  ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!canProceed()}
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  handleComplete();
                }
              }}
            >
              {step === 3 ? "Complete Setup" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;

