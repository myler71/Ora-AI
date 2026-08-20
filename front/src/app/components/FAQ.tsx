import { useState } from 'react';
import { Card } from './Card';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How accurate is the AI dental scanning?',
    answer: 'Our AI models have been trained on millions of dental images and achieve 98% accuracy in detecting cavities and other dental issues. However, Ora AI is designed to complement, not replace, professional dental care. Always consult with a licensed dentist for diagnosis and treatment.'
  },
  {
    question: 'Is my photo data secure and private?',
    answer: 'Absolutely. All photos are encrypted end-to-end during upload and processing. Your images are securely stored in our database for your convenience, and you have the full authority to delete them at any time. Ora AI is HIPAA compliant and strictly ensures that your data is never shared with third parties without your explicit consent.'
  },
  {
    question: 'What kind of photos should I upload?',
    answer: 'For best results, take a clear, well-lit photo of your teeth with your mouth open. Try to capture all visible teeth. Natural lighting works best, and make sure the photo is in focus. You can use your smartphone camera or any digital camera.'
  },
  {
    question: 'How long does the AI analysis take?',
    answer: 'Our AI analysis is lightning-fast; results are typically delivered within just a few seconds. While the processing time may vary slightly depending on the image size and your internet connection, we prioritize efficiency to ensure you get accurate insights almost instantly.'
  },
  {
    question: 'Can Ora AI replace my dentist?',
    answer: 'No. Ora AI is a screening and educational tool designed to help you monitor your dental health between professional visits. It cannot replace professional dental examinations, diagnoses, or treatments. Always consult with a licensed dentist for comprehensive care.'
  },
  {
    question: 'What dental issues can the AI detect?',
    answer: 'Think of our AI as a high-tech scanner for your smile. It looks deep into your tooth structure and gum health to spot everything from early-stage decay (Caries) and tartar buildup (Calculus) to gum inflammation (Gingivitis). It also picks up on discoloration, oral ulcers, and even missing teeth (Hypodontia), giving you a clear and instant overview of your dental health.'
  },
  {
    question: 'Is Ora AI free to use?',
    answer: 'You can jump right in and get 3 free scans without even creating an account! To keep track of your results, you can sign up for free. While the app is currently free to use, we’ll be introducing premium plans in the future with even more advanced features to help you level up your dental care.'
  },
  {
    question: 'Can I share my results with my dentist?',
    answer: 'Yes! You can download a comprehensive PDF report of your analysis and share it with your dentist. Many dental professionals find our AI insights helpful as a preliminary screening tool between regular checkups.'
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">Everything you need to know about Ora AI</p>
        </div>
        
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <Card key={index} variant="default" className="cursor-pointer hover:shadow-xl transition-shadow">
              <div onClick={() => toggleQuestion(index)}>
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-gray-900 pr-8">{faq.question}</h4>
                  <ChevronDown 
                    className={`w-6 h-6 text-[#3FA9F5] flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {openIndex === index && (
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
