import { useState } from 'react';
import { useMetaStore } from '@/store/metaStore';
import { metaOAuth } from '@/lib/metaApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Facebook,
  Key,
  Building2,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Info,
} from 'lucide-react';

interface MetaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MetaConnectModal({ isOpen, onClose, onSuccess }: MetaConnectModalProps) {
  const { connectAccount, isConnecting, error, clearError } = useMetaStore();
  
  // OAuth flow state
  const [activeTab, setActiveTab] = useState('oauth');
  
  // Manual connection form
  const [accountName, setAccountName] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [businessAccountId, setBusinessAccountId] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  
  // OAuth state
  const [oauthCode, setOauthCode] = useState('');

  const handleManualConnect = async () => {
    try {
      await connectAccount({
        name: accountName,
        accessToken,
        businessAccountId,
        phoneNumberId,
        appId: '',
      });
      onSuccess?.();
      onClose();
      // Reset form
      setAccountName('');
      setAccessToken('');
      setBusinessAccountId('');
      setPhoneNumberId('');
    } catch (err) {
      // Error handled by store
    }
  };

  const handleOAuthConnect = async () => {
    try {
      // In production, exchange code for token
      // const tokenData = await metaOAuth.exchangeCodeForToken(oauthCode);
      // const longLivedToken = await metaOAuth.getLongLivedToken(tokenData.access_token);
      
      // For demo, we'll use the code as the token
      await connectAccount({
        name: 'Meta Connected Account',
        accessToken: oauthCode,
        businessAccountId: 'oauth_business_id',
        phoneNumberId: 'oauth_phone_id',
        appId: '',
      });
      onSuccess?.();
      onClose();
      setOauthCode('');
    } catch (err) {
      // Error handled by store
    }
  };

  const openMetaOAuth = () => {
    const authUrl = metaOAuth.getAuthUrl(
      ['whatsapp_business_management', 'whatsapp_business_messaging', 'business_management'],
      `state_${Date.now()}`
    );
    window.open(authUrl, '_blank', 'width=600,height=700');
  };

  const isManualFormValid = accountName && accessToken && businessAccountId && phoneNumberId;
  const isOAuthFormValid = oauthCode.length > 10;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Facebook className="w-6 h-6 text-blue-600" />
            Connect Meta WhatsApp
          </DialogTitle>
          <DialogDescription>
            Connect your WhatsApp Business account via Meta Cloud API
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="oauth">OAuth Connect</TabsTrigger>
            <TabsTrigger value="manual">Manual Setup</TabsTrigger>
          </TabsList>

          {/* OAuth Tab */}
          <TabsContent value="oauth" className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Connect securely using your Meta account. You'll be redirected to Meta to authorize access.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Required Permissions
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• WhatsApp Business Management</li>
                  <li>• WhatsApp Business Messaging</li>
                  <li>• Business Management</li>
                </ul>
              </div>

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={openMetaOAuth}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Meta Authorization
              </Button>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="oauth-code">Authorization Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="oauth-code"
                    placeholder="Paste the code from Meta"
                    value={oauthCode}
                    onChange={(e) => {
                      setOauthCode(e.target.value);
                      clearError();
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigator.clipboard.readText().then(setOauthCode)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Copy the authorization code from the Meta popup and paste it here
                </p>
              </div>

              <Button
                className="w-full gradient-primary"
                onClick={handleOAuthConnect}
                disabled={!isOAuthFormValid || isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Facebook className="w-4 h-4 mr-2" />
                    Connect Account
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Manual Tab */}
          <TabsContent value="manual" className="space-y-4">
            <Alert className="bg-amber-50 border-amber-200">
              <Info className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                For advanced users. You'll need to create a Meta app and obtain credentials from the Meta Developer Console.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-name" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Account Name
                </Label>
                <Input
                  id="account-name"
                  placeholder="e.g., Acme Inc - Main"
                  value={accountName}
                  onChange={(e) => {
                    setAccountName(e.target.value);
                    clearError();
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="access-token" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Access Token
                </Label>
                <Input
                  id="access-token"
                  type="password"
                  placeholder="EAA..."
                  value={accessToken}
                  onChange={(e) => {
                    setAccessToken(e.target.value);
                    clearError();
                  }}
                />
                <p className="text-xs text-gray-500">
                  Generate from Meta Developer Console &gt; Your App &gt; WhatsApp &gt; API Setup
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-account-id" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Business Account ID
                </Label>
                <Input
                  id="business-account-id"
                  placeholder="1234567890"
                  value={businessAccountId}
                  onChange={(e) => {
                    setBusinessAccountId(e.target.value);
                    clearError();
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-number-id" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Phone Number ID
                </Label>
                <Input
                  id="phone-number-id"
                  placeholder="9876543210"
                  value={phoneNumberId}
                  onChange={(e) => {
                    setPhoneNumberId(e.target.value);
                    clearError();
                  }}
                />
              </div>

              <Button
                className="w-full gradient-primary"
                onClick={handleManualConnect}
                disabled={!isManualFormValid || isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Connect Account
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col gap-2">
          <p className="text-xs text-gray-500 text-center">
            By connecting, you agree to Meta's{' '}
            <a href="https://www.facebook.com/legal/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Terms of Service
            </a>
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
