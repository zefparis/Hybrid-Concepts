import { Mail, Phone, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Hybrid Concepts</span>
            </div>
            <p className="text-gray-300 text-sm">
              Plateforme SaaS d'optimisation logistique intelligente avec suivi multimodal et automatisation IA.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Globe className="w-4 h-4 text-blue-400" />
                <a href="https://www.hybridconc.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                  www.hybridconc.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <a href="mailto:bbogaerts@hybridconc.com" className="text-gray-300 hover:text-white transition-colors">
                  bbogaerts@hybridconc.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-400" />
                <a href="tel:+27727768777" className="text-gray-300 hover:text-white transition-colors">
                  +27 727 768 777
                </a>
              </div>
            </div>
          </div>

          {/* Chairman Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Direction</h3>
            <div className="text-sm">
              <p className="text-gray-300">
                <span className="font-medium text-white">Chairman</span>
              </p>
              <p className="text-gray-300">
                Benoît Bogaerts
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Hybrid Concepts. Tous droits réservés.
            </p>
            <p className="text-gray-400 text-sm mt-2 sm:mt-0">
              Plateforme d'optimisation logistique multimodale
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}