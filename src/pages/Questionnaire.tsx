import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type AgeGroup = 'preschool' | 'elementary' | 'tweens' | 'teens' | 'adults';

type FamilyMember = {
  id: string;
  ageGroup: AgeGroup | '';
};

type ContentPreferences = {
  avoidGriefLoss: boolean;
  avoidSubstances: boolean;
  avoidRomanceSexuality: boolean;
  avoidViolenceScare: boolean;
  avoidProfanity: boolean;
  avoidProductPlacement: boolean;
};

const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: 'preschool', label: 'Preschool (under 5)' },
  { value: 'elementary', label: 'Elementary (5-9)' },
  { value: 'tweens', label: 'Tween (10-12)' },
  { value: 'teens', label: 'Teen (13-17)' },
  { value: 'adults', label: 'Adult (18+)' },
];

export default function Questionnaire() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: '1', ageGroup: '' }
  ]);
  const [preferences, setPreferences] = useState<ContentPreferences>({
    avoidGriefLoss: false,
    avoidSubstances: false,
    avoidRomanceSexuality: false,
    avoidViolenceScare: false,
    avoidProfanity: false,
    avoidProductPlacement: false
  });

  useEffect(() => {
    if (location.state?.step) {
      setStep(location.state.step);
    }
  }, [location]);

  const addFamilyMember = () => {
    setFamilyMembers([
      ...familyMembers,
      { id: String(familyMembers.length + 1), ageGroup: '' }
    ]);
  };

  const updateFamilyMemberAge = (id: string, ageGroup: AgeGroup) => {
    setFamilyMembers(
      familyMembers.map(member =>
        member.id === id ? { ...member, ageGroup } : member
      )
    );
  };

  const removeFamilyMember = (id: string) => {
    if (familyMembers.length > 1) {
      setFamilyMembers(familyMembers.filter(member => member.id !== id));
    }
  };

  const updatePreference = (key: keyof ContentPreferences) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Here we would typically save the data and navigate to the next page
      console.log('Family Members:', familyMembers);
      console.log('Preferences:', preferences);
      navigate('/vibe-selector');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return familyMembers.every(member => member.ageGroup !== '');
    }
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 ? "Who's Watching?" : "Content Preferences"}
          </h2>
          <div className="text-sm text-gray-500">
            Step {step} of 2
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            {familyMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-4">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Family Member {member.id}
                  </label>
                  <select
                    value={member.ageGroup}
                    onChange={(e) => updateFamilyMemberAge(member.id, e.target.value as AgeGroup)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white"
                  >
                    <option value="">Select age group</option>
                    {AGE_GROUPS.map((group) => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </div>
                {familyMembers.length > 1 && (
                  <button
                    onClick={() => removeFamilyMember(member.id)}
                    className="mt-6 text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addFamilyMember}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              + Add Family Member
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Would you like to avoid any of the following?
              </h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.avoidGriefLoss}
                    onChange={() => updatePreference('avoidGriefLoss')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span>Themes of grief and loss</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.avoidSubstances}
                    onChange={() => updatePreference('avoidSubstances')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span>Drinking, drugs, smoking</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.avoidRomanceSexuality}
                    onChange={() => updatePreference('avoidRomanceSexuality')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span>Romance and sexuality</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.avoidViolenceScare}
                    onChange={() => updatePreference('avoidViolenceScare')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span>Violence and scariness</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.avoidProfanity}
                    onChange={() => updatePreference('avoidProfanity')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span>Curse words</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.avoidProductPlacement}
                    onChange={() => updatePreference('avoidProductPlacement')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span>Product placement</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={handleBack}
          className="btn btn-secondary"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <button
          onClick={handleNext}
          className="btn btn-primary"
          disabled={!isStepValid()}
        >
          {step === 2 ? 'Continue to Mood Board' : 'Next'}
        </button>
      </div>
    </div>
  );
} 