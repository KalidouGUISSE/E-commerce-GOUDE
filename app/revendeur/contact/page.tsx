/**
 * Page de contact support
 * Route: /revendeur/contact
 * 
 * Fonctionnalités:
 * - Formulaire de contact
 * - Historique des messages
 * - Informations de contact
 */

'use client'

import { useState } from 'react'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle,
  Paperclip,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react'
import { useResellerContact, ContactMessage } from '@/hooks/use-reseller-contact'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ResellerContactPage() {
  const { 
    isLoading, 
    feedback, 
    messages, 
    contactInfo, 
    sendMessage 
  } = useResellerContact()

  const [formData, setFormData] = useState<{
    subject: string
    category: 'general' | 'sales' | 'technical' | 'billing' | 'partnership'
    priority: 'low' | 'medium' | 'high'
    message: string
    attachments: string[]
  }>({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: '',
    attachments: [],
  })

  const handleSubmit = async () => {
    await sendMessage(formData)
    setFormData({
      subject: '',
      category: 'general',
      priority: 'medium',
      message: '',
      attachments: [],
    })
  }

  const getStatusBadge = (status: ContactMessage['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      sent: 'secondary',
      read: 'outline',
      replied: 'default',
    }
    const labels: Record<string, string> = {
      sent: 'Envoyé',
      read: 'Lu',
      replied: 'Répondu',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getCategoryBadge = (category: ContactMessage['category']) => {
    const labels: Record<string, string> = {
      general: 'Général',
      sales: 'Commercial',
      technical: 'Technique',
      billing: 'Facturation',
      partnership: 'Partenariat',
    }
    return labels[category] || category
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${
          feedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <Check className="w-5 h-5" />
          {feedback.message}
        </div>
      )}

      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact Support</h1>
        <p className="text-muted-foreground">
          Notre équipe est disponible pour répondre à vos questions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulaire de contact */}
        <Card>
          <CardHeader>
            <CardTitle>Envoyez-nous un message</CardTitle>
            <CardDescription>
              Nous vous répondrons dans les meilleurs délais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input
                  id="subject"
                  placeholder="Résumé de votre demande"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      category: value as ContactMessage['category'] 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Général</SelectItem>
                      <SelectItem value="sales">Commercial</SelectItem>
                      <SelectItem value="technical">Technique</SelectItem>
                      <SelectItem value="billing">Facturation</SelectItem>
                      <SelectItem value="partnership">Partenariat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priorité</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      priority: value as ContactMessage['priority'] 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Décrivez votre demande en détail..."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Joindre un fichier
                </Button>
                <span className="text-xs text-muted-foreground">
                  Max 5MB - Formats: PDF, JPG, PNG
                </span>
              </div>

              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={!formData.subject || !formData.message || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Envoyer le message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informations de contact */}
        <div className="space-y-6">
          {/* Coordonnées */}
          <Card>
            <CardHeader>
              <CardTitle>Nos coordonnées</CardTitle>
              <CardDescription>
                Plusieurs moyens de nous contacter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">{contactInfo.email}</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Téléphone</div>
                  <div className="text-sm text-muted-foreground">{contactInfo.phone}</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Adresse</div>
                  <div className="text-sm text-muted-foreground">{contactInfo.address}</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Heures d'ouverture</div>
                  <div className="text-sm text-muted-foreground">{contactInfo.hours}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Délai de réponse */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-primary" />
                <div>
                  <div className="font-medium">Délai de réponse</div>
                  <div className="text-sm text-muted-foreground">
                    Nous nous engageons à répondre sous {contactInfo.responseTime}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historique des messages */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des messages</CardTitle>
          <CardDescription>
            {messages.length} message(s) envoyé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun message envoyé</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="font-medium">{msg.subject}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Badge variant="outline">{getCategoryBadge(msg.category)}</Badge>
                          <span>{formatDateTime(msg.createdAt)}</span>
                        </div>
                      </div>
                      {getStatusBadge(msg.status)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {msg.message}
                    </p>
                    {msg.attachments.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {msg.attachments.length} pièce(s) jointe(s)
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
