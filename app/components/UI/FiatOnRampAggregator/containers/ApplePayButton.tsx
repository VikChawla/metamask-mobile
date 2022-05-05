import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { protectWalletModalNotVisible } from '../../../../actions/user';
import { addFiatOrder } from '../../../../reducers/fiatOrders';
import ApplePayButtonComponent from '../components/ApplePayButton';
import useApplePay, { ABORTED } from '../hooks/applePay';
import Logger from '../../../../util/Logger';
import NotificationManager from '../../../../core/NotificationManager';
import { strings } from '../../../../../locales/i18n';
import { setLockTime } from '../../../../actions/settings';
import { FiatOrder, getNotificationDetails } from '../../FiatOrders';
import { QuoteResponse } from '@consensys/on-ramp-sdk';

const ApplePayButton = ({
  quote,
  label,
}: {
  quote: QuoteResponse;
  label: string;
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [pay] = useApplePay(quote) as [
    () => Promise<FiatOrder | typeof ABORTED>,
  ];
  const lockTime = useSelector((state: any) => state.settings.lockTime);

  const addOrder = useCallback(
    (order) => dispatch(addFiatOrder(order)),
    [dispatch],
  );
  const protectWalletModalVisible = useCallback(
    () => dispatch(protectWalletModalNotVisible()),
    [dispatch],
  );

  const handlePress = useCallback(async () => {
    const prevLockTime = lockTime;
    setLockTime(-1);
    try {
      const order = await pay();
      if (order !== ABORTED) {
        if (order) {
          addOrder(order);
          // @ts-expect-error pop is not defined
          navigation.dangerouslyGetParent()?.pop();
          protectWalletModalVisible();
          NotificationManager.showSimpleNotification(
            getNotificationDetails(order),
          );
        } else {
          Logger.error('FiatOnRampAgg::ApplePay empty order response', order);
        }
      }
    } catch (error: any) {
      NotificationManager.showSimpleNotification({
        duration: 5000,
        title: strings('fiat_on_ramp.notifications.purchase_failed_title', {
          currency: quote.crypto?.symbol,
        }),
        description: error.message,
        status: 'error',
      });
      Logger.error(error, 'FiatOrders::WyreApplePayProcessor Error');
    } finally {
      setLockTime(prevLockTime);
    }
  }, [
    addOrder,
    lockTime,
    navigation,
    pay,
    protectWalletModalVisible,
    quote.crypto?.symbol,
  ]);

  return <ApplePayButtonComponent label={label} onPress={handlePress} />;
};

export default ApplePayButton;
