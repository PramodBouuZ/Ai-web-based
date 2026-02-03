import { useState } from 'react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { useSubscriptionStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  Check,
  Sparkles,
  Zap,
  Building2,
  Crown,
  ArrowRight,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  MoreHorizontal,
} from 'lucide-react';

const billingHistory = [
  { id: 'inv_1', date: '2024-01-01', amount: 79, status: 'paid', description: 'Growth Plan - Monthly' },
  { id: 'inv_2', date: '2023-12-01', amount: 79, status: 'paid', description: 'Growth Plan - Monthly' },
  { id: 'inv_3', date: '2023-11-01', amount: 79, status: 'paid', description: 'Growth Plan - Monthly' },
  { id: 'inv_4', date: '2023-10-01', amount: 29, status: 'paid', description: 'Starter Plan - Monthly' },
];

const paymentMethods = [
  { id: 'pm_1', type: 'card', brand: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
  { id: 'pm_2', type: 'card', brand: 'Mastercard', last4: '8888', expiry: '08/26', isDefault: false },
];

export function Subscription() {
  const { subscription, plans, subscribe, cancelSubscription, isLoading } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const currentPlan = subscription?.plan;
  const usage = subscription?.usage;

  const handleUpgrade = async () => {
    if (selectedPlan) {
      await subscribe(selectedPlan);
      setIsUpgradeDialogOpen(false);
      setSelectedPlan(null);
    }
  };

  const handleCancel = async () => {
    await cancelSubscription();
    setIsCancelDialogOpen(false);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'plan_starter':
        return <Zap className="w-6 h-6" />;
      case 'plan_growth':
        return <Sparkles className="w-6 h-6" />;
      case 'plan_business':
        return <Building2 className="w-6 h-6" />;
      case 'plan_enterprise':
        return <Crown className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'plan_starter':
        return 'bg-blue-500';
      case 'plan_growth':
        return 'bg-purple-500';
      case 'plan_business':
        return 'bg-orange-500';
      case 'plan_enterprise':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      {currentPlan && (
        <Card className="border-2 border-[#25D366]/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center text-white', getPlanColor(currentPlan.id))}>
                  {getPlanIcon(currentPlan.id)}
                </div>
                <div>
                  <CardTitle className="text-2xl">{currentPlan.name} Plan</CardTitle>
                  <CardDescription>
                    {subscription?.cancelAtPeriodEnd ? (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Cancels on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    ) : (
                      `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    )}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{formatCurrency(currentPlan.price)}</p>
                <p className="text-sm text-gray-500">/month</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Messages</span>
                  <span className="text-sm font-medium">
                    {formatNumber(usage?.messagesSent || 0)} / {formatNumber(currentPlan.limits.messagesPerMonth)}
                  </span>
                </div>
                <Progress
                  value={((usage?.messagesSent || 0) / currentPlan.limits.messagesPerMonth) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Contacts</span>
                  <span className="text-sm font-medium">
                    {formatNumber(usage?.contacts || 0)} / {formatNumber(currentPlan.limits.contacts)}
                  </span>
                </div>
                <Progress
                  value={((usage?.contacts || 0) / currentPlan.limits.contacts) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Chatbots</span>
                  <span className="text-sm font-medium">
                    {usage?.chatbots || 0} / {currentPlan.limits.chatbots}
                  </span>
                </div>
                <Progress
                  value={((usage?.chatbots || 0) / currentPlan.limits.chatbots) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(true)}
              disabled={subscription?.cancelAtPeriodEnd}
            >
              {subscription?.cancelAtPeriodEnd ? 'Cancellation Scheduled' : 'Cancel Subscription'}
            </Button>
            <Button className="gradient-primary" onClick={() => setIsUpgradeDialogOpen(true)}>
              Upgrade Plan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Pricing Plans */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'relative card-hover',
                currentPlan?.id === plan.id && 'border-2 border-[#25D366]',
                plan.isPopular && 'ring-2 ring-purple-500 ring-offset-2'
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-purple-500">Most Popular</Badge>
                </div>
              )}
              {currentPlan?.id === plan.id && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#25D366]">Current Plan</Badge>
                </div>
              )}
              <CardHeader>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4', getPlanColor(plan.id))}>
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold">
                    {plan.price === 0 ? 'Custom' : formatCurrency(plan.price)}
                  </span>
                  {plan.price > 0 && <span className="text-gray-500">/month</span>}
                </div>
                <ul className="space-y-2">
                  {plan.features.slice(0, 6).map((feature) => (
                    <li key={feature.name} className="flex items-start gap-2 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'text-gray-400'}>
                        {feature.name}
                        {feature.limit && feature.limit !== Infinity && ` (${formatNumber(feature.limit)})`}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {currentPlan?.id === plan.id ? (
                  <Button variant="outline" className="w-full" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className={cn('w-full', plan.isPopular && 'gradient-primary')}
                    variant={plan.isPopular ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setIsUpgradeDialogOpen(true);
                    }}
                  >
                    {plan.price === 0 ? 'Contact Sales' : 'Upgrade'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs for Billing & Payment Methods */}
      <Tabs defaultValue="billing" className="mt-8">
        <TabsList>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View and download your past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment options</CardDescription>
              </div>
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Method
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {method.brand} ending in {method.last4}
                        </p>
                        <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && <Badge variant="secondary">Default</Badge>}
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              You are about to upgrade to the{' '}
              {plans.find((p) => p.id === selectedPlan)?.name} plan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPlan && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">
                    {plans.find((p) => p.id === selectedPlan)?.name} Plan
                  </span>
                  <span className="text-xl font-bold">
                    {formatCurrency(plans.find((p) => p.id === selectedPlan)?.price || 0)}/mo
                  </span>
                </div>
                <ul className="space-y-2 text-sm">
                  {plans
                    .find((p) => p.id === selectedPlan)
                    ?.features.slice(0, 5)
                    .map((feature) => (
                      <li key={feature.name} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature.name}
                        {feature.limit && feature.limit !== Infinity && ` (${formatNumber(feature.limit)})`}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="gradient-primary" onClick={handleUpgrade} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirm Upgrade
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You will lose access to premium
              features at the end of your billing period.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    What you will lose:
                  </p>
                  <ul className="mt-2 text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li>Access to AI-powered chatbots</li>
                    <li>CRM integrations</li>
                    <li>Advanced analytics</li>
                    <li>Priority support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
