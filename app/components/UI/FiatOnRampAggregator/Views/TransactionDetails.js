import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';
import StyledButton from '../../StyledButton';
import { useNavigation } from '@react-navigation/native';
import TransactionDetail from '../components/TransactionDetails';
import PropTypes from 'prop-types';
import Account from '../components/Account';
import { strings } from '../../../../../locales/i18n';
import { makeOrderIdSelector } from '../../../../reducers/fiatOrders';
import { useSelector } from 'react-redux';

const styles = StyleSheet.create({
	screenLayout: {
		paddingTop: 0,
	},
});
const mockOrder = {
	status: 'confirmed',
	transactionID: 'QY34A1TAY3R',
	dateAndTime: 'FEB 2 2022, 5:05 PM UTC',
	paymentMethod: 'DEBIT CARD 2755',
	tokenAmount: '0.0687202',
	fiatAmount: '$280.54',
	exchangeRate: '1 ETH @ $4,3427.86',
	totalFees: '$19.46',
	providerName: 'MoonPay',
	purchaseAmountTotal: '$300 USD',
	paymentType: 'bank',
};

const TransactionDetails = ({ orderId }) => {
	const orderById = useSelector(makeOrderIdSelector(orderId));
	const order = orderById || mockOrder;
	const navigation = useNavigation();

	const handleMakeAnotherPurchase = useCallback(() => {
		navigation.navigate('PaymentMethod');
	}, [navigation]);

	return (
		<ScreenLayout>
			<ScreenLayout.Header>
				<Account />
			</ScreenLayout.Header>
			<ScreenLayout.Body>
				<ScreenLayout.Content style={styles.screenLayout}>
					<TransactionDetail order={order} />
				</ScreenLayout.Content>
			</ScreenLayout.Body>
			<ScreenLayout.Footer>
				<ScreenLayout.Content>
					<View>
						<StyledButton type="confirm" onPress={handleMakeAnotherPurchase}>
							{strings('fiat_on_ramp_aggregator.transaction.another_purchase')}
						</StyledButton>
					</View>
				</ScreenLayout.Content>
			</ScreenLayout.Footer>
		</ScreenLayout>
	);
};

TransactionDetails.navigationOptions = () => ({
	headerLeft: () => null,
	title: strings('fiat_on_ramp_aggregator.transaction.details_main'),
});

TransactionDetails.propTypes = {
	/**
	 * Object that represents the current route info like params passed to it
	 */
	orderId: PropTypes.string,
};

export default TransactionDetails;
