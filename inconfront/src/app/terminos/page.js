import React from 'react';

const Terminos = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-10">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-4xl font-extrabold mb-5 text-gray-900">Términos de Uso</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">1. Introducción</h2>
          <p className="text-gray-700 leading-relaxed">
            Bienvenido a Faena. Estos Términos de Uso rigen el acceso y uso de nuestro sitio web, servicios y productos. Al acceder o utilizar nuestros servicios, aceptas cumplir con estos términos. Si no estás de acuerdo con alguna parte de los términos, no debes utilizar nuestros servicios.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">2. Uso del Sitio y Servicios</h2>
          <p className="text-gray-700 leading-relaxed">
            Nuestro sitio web y servicios están destinados únicamente para uso legítimo y autorizado. No debes utilizar nuestros servicios para ningún propósito ilegal o no autorizado. Además, aceptas no interferir o interrumpir el funcionamiento de nuestro sitio o servicios.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">3. Propiedad Intelectual</h2>
          <p className="text-gray-700 leading-relaxed">
            Todos los contenidos, incluyendo pero no limitado a textos, gráficos, logotipos, íconos, imágenes y software, son propiedad de Faena o de sus respectivos propietarios y están protegidos por las leyes de propiedad intelectual. No debes reproducir, distribuir, modificar o crear obras derivadas de ningún contenido sin el consentimiento expreso por escrito de Faena.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">4. Responsabilidad del Usuario</h2>
          <p className="text-gray-700 leading-relaxed">
            Como usuario, eres responsable de mantener la confidencialidad de tu información de cuenta, incluidas tus credenciales de inicio de sesión. Eres responsable de todas las actividades que ocurran bajo tu cuenta. Debes notificar inmediatamente a Faena sobre cualquier uso no autorizado de tu cuenta.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">5. Limitación de Responsabilidad</h2>
          <p className="text-gray-700 leading-relaxed">
            Faena no será responsable de ningún daño directo, indirecto, incidental, especial o consecuente que resulte del uso o la imposibilidad de uso de nuestros servicios. Esto incluye, pero no se limita a, daños por pérdida de beneficios, uso, datos u otras pérdidas intangibles.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">6. Cambios en los Términos de Uso</h2>
          <p className="text-gray-700 leading-relaxed">
            Nos reservamos el derecho de modificar estos Términos de Uso en cualquier momento. Te notificaremos sobre cualquier cambio publicando los nuevos términos en nuestro sitio web. Es tu responsabilidad revisar periódicamente estos términos. El uso continuo de nuestros servicios después de cualquier modificación constituye la aceptación de los nuevos términos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">7. Ley Aplicable</h2>
          <p className="text-gray-700 leading-relaxed">
            Estos Términos de Uso se regirán e interpretarán de acuerdo con las leyes de [País], sin tener en cuenta sus conflictos de principios legales. Cualquier disputa derivada de estos términos se resolverá exclusivamente en los tribunales ubicados en [Ciudad, País].
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">8. Contacto</h2>
          <p className="text-gray-700 leading-relaxed">
            Si tienes alguna pregunta sobre estos Términos de Uso, por favor contáctanos en [correo electrónico de contacto] o en la siguiente dirección: [Dirección de la Empresa].
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terminos;
