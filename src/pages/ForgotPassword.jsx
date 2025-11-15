import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-password-reset`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de l\'email');
      }

      setEmailSent(true);
      toast.success('Email de réinitialisation envoyé !');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.jpg"
              alt="Yam Management"
              className="w-24 h-24 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
          <CardDescription>
            {emailSent
              ? 'Consultez votre boîte mail'
              : 'Entrez votre email pour réinitialiser votre mot de passe'}
          </CardDescription>
        </CardHeader>

        {emailSent ? (
          <>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-center text-slate-600">
                  Un email avec les instructions pour réinitialiser votre mot de passe a été envoyé à{' '}
                  <strong>{email}</strong>
                </p>
                <p className="text-sm text-center text-slate-500">
                  Si vous ne recevez pas l'email, vérifiez votre dossier spam.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </Button>
              </Link>
            </CardFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer le lien de réinitialisation'
                )}
              </Button>
              <Link to="/login" className="w-full">
                <Button variant="ghost" className="w-full" type="button">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </Button>
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
