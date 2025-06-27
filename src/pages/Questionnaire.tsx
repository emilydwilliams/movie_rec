import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';

type AgeGroup = 'preschool' | 'elementary' | 'tweens' | 'teens' | 'adults';

type FamilyMember = {
  id: string;
  ageGroup: AgeGroup | '';
  error?: string;
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
  { 
    value: 'preschool', 
    label: 'Preschool (under 5)'
  },
  { 
    value: 'elementary', 
    label: 'Elementary (5-9)'
  },
  { 
    value: 'tweens', 
    label: 'Tween (10-12)'
  },
  { 
    value: 'teens', 
    label: 'Teen (13-17)'
  },
  { 
    value: 'adults', 
    label: 'Adult (18+)'
  }
];

const CONTENT_PREFERENCES: { 
  key: keyof ContentPreferences; 
  label: string;
}[] = [
  {
    key: 'avoidGriefLoss',
    label: 'Themes of grief and loss'
  },
  {
    key: 'avoidSubstances',
    label: 'Drinking, drugs, smoking'
  },
  {
    key: 'avoidRomanceSexuality',
    label: 'Romance and sexuality'
  },
  {
    key: 'avoidViolenceScare',
    label: 'Violence and scariness'
  },
  {
    key: 'avoidProfanity',
    label: 'Strong language'
  },
  {
    key: 'avoidProductPlacement',
    label: 'Product placement'
  }
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
        member.id === id ? { ...member, ageGroup, error: undefined } : member
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

  const validateStep = () => {
    if (step === 1) {
      const newFamilyMembers = familyMembers.map(member => ({
        ...member,
        error: member.ageGroup === '' ? 'Please select an age group' : undefined
      }));
      setFamilyMembers(newFamilyMembers);
      return newFamilyMembers.every(member => !member.error);
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (step < 2) {
      setStep(step + 1);
    } else {
      // Save data and navigate
      const familyData = {
        members: familyMembers,
        preferences: preferences
      };
      console.log('Saving family data:', familyData);
      navigate('/vibe-selector', { state: { familyData } });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {step === 1 ? "Who's Watching?" : "Content Preferences"}
        </h2>

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
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white
                      ${member.error ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select age group</option>
                    {AGE_GROUPS.map((group) => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                  {member.error && (
                    <p className="mt-1 text-sm text-red-500">{member.error}</p>
                  )}
                </div>
                {familyMembers.length > 1 && (
                  <button
                    onClick={() => removeFamilyMember(member.id)}
                    className="mt-6 text-red-600 hover:text-red-700"
                    aria-label="Remove family member"
                  >
                    <TrashIcon className="h-5 w-5" />
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
                {CONTENT_PREFERENCES.map((pref) => (
                  <label key={pref.key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences[pref.key]}
                      onChange={() => updatePreference(pref.key)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span>{pref.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="btn btn-secondary"
          >
            Back
          </button>
                      <button
              onClick={handleNext}
              className="btn btn-primary"
            >
              Next
            </button>
        </div>
      </div>
    </div>
  );
} 